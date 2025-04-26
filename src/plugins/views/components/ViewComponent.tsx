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

  useEffect(() => {
    if (!context) return;

    let mounted = true;

    PluginManager.getInstance()
      .getPlugin('@composaic/views')
      .then((viewsPlugin) => {
        if (!mounted || !viewsPlugin) return;

        const containerViews = (viewsPlugin as ViewsPlugin).getViewsByContainer(
          context,
        );
        if (!containerViews) return;

        const slotComponent = containerViews.components.find(
          ({ component }) => component.slot === slot,
        );

        if (slotComponent) {
          PluginManager.getInstance()
            .getPlugin(slotComponent.plugin)
            .then((pluginInstance) => {
              if (mounted && pluginInstance) {
                const ComponentToRender = pluginInstance.getModule(
                  slotComponent.component.component,
                ) as React.FC<ViewableComponentProps>;
                setComponent(() => ComponentToRender);
              }
            });
        }
      });

    return () => {
      mounted = false;
    };
  }, [context, slot]);

  if (!Component || !eventBus) {
    return null;
  }

  return <Component events={eventBus} />;
};
