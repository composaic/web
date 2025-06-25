import React, { useEffect, useState } from 'react';
import { PluginManager } from '@composaic/core';
import { ViewsPlugin } from '..';

interface DynaComponentProps {
  componentId: string;
  props?: Record<string, any>;
  children?: React.ReactNode;
  fallback?: React.ComponentType<{ error: string }>;
}

export const DynaComponent: React.FC<DynaComponentProps> = ({
  componentId,
  props = {},
  children,
  fallback: Fallback,
}) => {
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rerenderKey, setRerenderKey] = useState(0);

  // Plugin changes handler (similar to ViewComponent)
  useEffect(() => {
    if (!componentId) return;

    const unsubscribe =
      PluginManager.getInstance().registerPluginChangeListener(
        ['@composaic/views'], // Listen for views plugin changes (it will notify when component definitions change)
        (pluginId) => {
          console.log(
            `[DynaComponent] Plugin change detected for ${pluginId}, reloading component`,
          );
          // Simple implementation: just trigger rerender on any views plugin change
          setRerenderKey((current) => current + 1);

          // Force reload component
          setLoading(true);
          setComponent(null);
          setError(null);
        },
      );

    return () => {
      unsubscribe();
    };
  }, [componentId]);

  // Component loading (similar to ViewComponent)
  useEffect(() => {
    let isMounted = true;

    async function loadComponent() {
      if (!componentId) return;

      try {
        console.log(`[DynaComponent:${componentId}] Starting component load`);
        setLoading(true);
        setError(null);

        const viewsPlugin = (await PluginManager.getInstance().getPlugin(
          '@composaic/views',
        )) as ViewsPlugin;

        if (!isMounted) {
          console.log(
            `[DynaComponent:${componentId}] Component unmounted during views plugin load`,
          );
          return;
        }

        if (!viewsPlugin) {
          throw new Error('Views plugin not found');
        }

        // Get component definition
        const componentDef = viewsPlugin.getComponentById(componentId);
        if (!componentDef) {
          throw new Error(`Component not found: ${componentId}`);
        }

        console.log(
          `[DynaComponent:${componentId}] Found component definition:`,
          componentDef,
        );

        // Validate props
        const validation = viewsPlugin.validateProps(componentId, props);
        if (!validation.success) {
          throw new Error(`Invalid props: ${validation.error}`);
        }

        console.log(`[DynaComponent:${componentId}] Props validation passed`);

        // Load the actual React component
        const pluginInstance = await PluginManager.getInstance().getPlugin(
          componentDef.plugin!,
        );

        if (!isMounted) {
          console.log(
            `[DynaComponent:${componentId}] Component unmounted during plugin instance load`,
          );
          return;
        }

        if (!pluginInstance) {
          throw new Error(`Plugin instance not found: ${componentDef.plugin}`);
        }

        // Get the component class using the plugin's getModule method
        const ComponentToRender = pluginInstance.getModule(
          componentDef.componentClass,
        ) as React.FC;

        if (!ComponentToRender) {
          throw new Error(
            `Component class not found: ${componentDef.componentClass}`,
          );
        }

        console.log(
          `[DynaComponent:${componentId}] Successfully loaded component`,
        );
        setComponent(() => ComponentToRender);
      } catch (err) {
        if (isMounted) {
          console.error(
            `[DynaComponent:${componentId}] Error loading component:`,
            err,
          );
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadComponent();

    return () => {
      console.log(
        `[DynaComponent:${componentId}] Cleanup - marking as unmounted`,
      );
      isMounted = false;
    };
  }, [componentId, props, rerenderKey]);

  if (loading) {
    return <div>Loading component...</div>;
  }

  if (error) {
    if (Fallback) {
      return <Fallback error={error} />;
    }
    return <div>Error loading component: {error}</div>;
  }

  if (!Component) {
    return null;
  }

  // Pass validated props and children to the component
  return React.createElement(Component, props, children);
};
