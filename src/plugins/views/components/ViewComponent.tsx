import React, { useContext, useEffect, useState } from 'react';
import { ViewContext } from './ViewContext';
import { PluginManager } from '@composaic/core';
import { ViewsPlugin, ViewDefinition } from '..';
import { LocalEventBus } from '../LocalEventBus';

interface ViewComponentProps {
  slot: string;
}

interface ViewableComponentProps {
  events: LocalEventBus;
}

export const ViewComponent: React.FC<ViewComponentProps> = ({ slot }) => {
  const { context, eventBus } = useContext(ViewContext);
  const [Component, setComponent] =
    useState<React.FC<ViewableComponentProps> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!context) {
      console.log(`[ViewComponent:${slot}] No context available`);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadComponent() {
      try {
        console.log(
          `[ViewComponent:${slot}] Starting component load for context: ${context}`,
        );
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
        const containerViews = viewsPlugin.getViewsByContainer(context);
        if (!containerViews) {
          throw new Error(`No views found for container: ${context}`);
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
        ) as React.FC<ViewableComponentProps>;

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
  }, [context, slot]);

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

  if (!Component || !eventBus) {
    console.log(`[ViewComponent:${slot}] No component or event bus available`);
    return null;
  }

  console.log(`[ViewComponent:${slot}] Rendering component`);
  return <Component events={eventBus} />;
};
