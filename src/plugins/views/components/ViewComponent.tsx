import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PluginManager } from '@composaic/core';
import { ViewContext, ViewMessage } from './ViewContext';
import { ViewsPlugin } from '..';

interface ViewComponentProps {
  id?: string;
  slot?: string;
  children?: React.ReactNode;
  containerId?: string; // Internal prop used for container coordination
}

export const ViewComponent: React.FC<ViewComponentProps> = ({
  id,
  slot,
  containerId,
  children,
}) => {
  // Component state
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [loading, setLoading] = useState(slot ? true : false);
  const [error, setError] = useState<Error | null>(null);

  // Container state (from original ViewContainer)
  const [rerenderKey, setRerenderKey] = useState(0);
  const handlers = useRef<((msg: ViewMessage) => void)[]>([]);

  // Message handling (from ViewContainer)
  const emit = useCallback((msg: ViewMessage) => {
    handlers.current.forEach((h) => h(msg));
  }, []);

  const on = useCallback((handler: (msg: ViewMessage) => void) => {
    handlers.current.push(handler);
    return () => {
      handlers.current = handlers.current.filter((h) => h !== handler);
    };
  }, []);

  // Context value when acting as container
  const contextValue = useMemo(
    () => ({
      emit,
      on,
    }),
    [emit, on],
  );

  // Plugin changes handler (from ViewContainer)
  useEffect(() => {
    if (!id) return;

    const unsubscribe =
      PluginManager.getInstance().registerPluginChangeListener(
        ['@composaic/views'],
        () => {
          // Simple implementation: just trigger rerender on any views plugin change
          setRerenderKey((current) => current + 1);

          // Also force reload if we're a slot component
          if (slot) {
            setLoading(true);
            setComponent(null);
            setError(null);
          }
        },
      );

    return () => {
      unsubscribe();
    };
  }, [id, slot]);

  // Component loading (from ViewComponent)
  useEffect(() => {
    let isMounted = true;

    async function loadComponent() {
      if (!slot) return;

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

        // Use containerId prop passed from parent ViewComponent
        if (!containerId) {
          throw new Error(
            'No container ID provided - this ViewComponent must be a child of a container ViewComponent',
          );
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
  }, [slot, containerId]);

  // Container mode
  if (id) {
    // Clone child ViewComponents to inject containerId
    const enhancedChildren = React.Children.map(children, (child) => {
      if (
        React.isValidElement(child) &&
        typeof child.type === 'function' &&
        (child.type as React.FC<ViewComponentProps>) === ViewComponent
      ) {
        // Cast the props to ViewComponentProps to ensure type safety
        return React.cloneElement(child, {
          ...child.props,
          containerId: id,
        } as ViewComponentProps);
      }
      return child;
    });

    return (
      <ViewContext.Provider value={contextValue} key={rerenderKey}>
        {enhancedChildren}
      </ViewContext.Provider>
    );
  }

  // Component in slot mode
  if (loading) {
    return <div>Loading component...</div>;
  }

  if (error) {
    return <div>Error loading component: {error.message}</div>;
  }

  if (!Component) {
    return null;
  }

  // Return component directly without wrapping div to maintain styling
  return <Component />;
};
