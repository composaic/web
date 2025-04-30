import React, { useEffect, useState } from 'react';
import { PluginManager } from '@composaic/core';
import { LocalEventBus } from '../LocalEventBus';
import { ViewContext } from './ViewContext';

interface ViewContainerProps {
  context: string;
  eventBus?: LocalEventBus;
  children?: React.ReactNode;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({
  context,
  eventBus,
  children,
}) => {
  const [rerenderKey, setRerenderKey] = useState(0);

  useEffect(() => {
    // Register for views plugin changes
    const unsubscribe =
      PluginManager.getInstance().registerPluginChangeListener(
        ['@composaic/views'],
        () => {
          // Simple implementation: just trigger rerender on any views plugin change
          setRerenderKey((current) => current + 1);
        },
      );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ViewContext.Provider value={{ context, eventBus }} key={rerenderKey}>
      {children}
    </ViewContext.Provider>
  );
};
