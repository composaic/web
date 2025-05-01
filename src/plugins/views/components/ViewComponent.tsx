import React, { useEffect, useState } from 'react';
import { PluginManager } from '@composaic/core';
import { ViewsPlugin } from '..';

interface ViewComponentProps {
  slot: string;
}

export const ViewComponent: React.FC<ViewComponentProps> = ({ slot }) => {
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadComponent() {
      try {
        console.log(`[ViewComponent:${slot}] Starting component load`);
        setLoading(true);
        setError(null);

        const viewsPlugin = (await PluginManager.getInstance().getPlugin(
          '@composaic/views',
        )) as ViewsPlugin;

        if (!isMounted) {
          console.log(
            `[ViewComponent:${slot}] Component unmounted during views plugin load`,
          );
          return;
        }

        if (!viewsPlugin) {
          console.error(`[ViewComponent:${slot}] Views plugin not found`);
          return;
        }

        console.log(
          `[ViewComponent:${slot}] Got views plugin, getting container views`,
        );
        // Use parent div's data attribute to get container id
        const containerElement = document.querySelector(
          '[data-view-container]',
        );
        const containerId = containerElement?.getAttribute(
          'data-view-container',
        );

        if (!containerId) {
          throw new Error('No container ID found');
        }

        const containerViews = viewsPlugin.getViewsByContainer(containerId);
        if (!containerViews) {
          throw new Error(`No views found for container: ${containerId}`);
        }

        console.log(`[ViewComponent:${slot}] Container views:`, containerViews);
        const slotComponent = containerViews.components.find(
          ({ component }) => component.slot === slot,
        );

        if (!slotComponent) {
          console.log(
            `[ViewComponent:${slot}] No component found for slot in:`,
            containerViews.components,
          );
          throw new Error(`No component found for slot: ${slot}`);
        }

        console.log(
          `[ViewComponent:${slot}] Found slot component:`,
          slotComponent,
        );
        const pluginInstance = await PluginManager.getInstance().getPlugin(
          slotComponent.plugin,
        );

        if (!isMounted) {
          console.log(
            `[ViewComponent:${slot}] Component unmounted during plugin instance load`,
          );
          return;
        }

        if (!pluginInstance) {
          console.error(
            `[ViewComponent:${slot}] Plugin instance not found for:`,
            slotComponent.plugin,
          );
          return;
        }

        console.log(
          `[ViewComponent:${slot}] Loading module:`,
          slotComponent.component.component,
        );
        const ComponentToRender = pluginInstance.getModule(
          slotComponent.component.component,
        ) as React.FC;

        if (!ComponentToRender) {
          throw new Error(
            `Component not found: ${slotComponent.component.component}`,
          );
        }

        console.log(`[ViewComponent:${slot}] Successfully loaded component`);
        setComponent(() => ComponentToRender);
      } catch (err) {
        if (isMounted) {
          console.error(
            `[ViewComponent:${slot}] Error loading component:`,
            err,
          );
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadComponent();

    return () => {
      console.log(`[ViewComponent:${slot}] Cleanup - marking as unmounted`);
      isMounted = false;
    };
  }, [slot]);

  if (loading) {
    console.log(`[ViewComponent:${slot}] Rendering loading state`);
    return <div>Loading component...</div>;
  }

  if (error) {
    console.log(
      `[ViewComponent:${slot}] Rendering error state:`,
      error.message,
    );
    return <div>Error loading component: {error.message}</div>;
  }

  if (!Component) {
    console.log(`[ViewComponent:${slot}] No component available`);
    return null;
  }

  console.log(`[ViewComponent:${slot}] Rendering component`);
  return <Component />;
};
