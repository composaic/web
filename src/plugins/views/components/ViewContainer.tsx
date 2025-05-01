import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PluginManager } from '@composaic/core';
import { ViewContext, ViewMessage } from './ViewContext';

interface ViewContainerProps {
  id: string; // renamed from 'context'
  children?: React.ReactNode;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({
  id,
  children,
}) => {
  const [rerenderKey, setRerenderKey] = useState(0);
  const handlers = useRef<((msg: ViewMessage) => void)[]>([]);

  const emit = useCallback((msg: ViewMessage) => {
    handlers.current.forEach((h) => h(msg));
  }, []);

  const on = useCallback((handler: (msg: ViewMessage) => void) => {
    handlers.current.push(handler);
    return () => {
      handlers.current = handlers.current.filter((h) => h !== handler);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      emit,
      on,
    }),
    [emit, on],
  );

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
    <ViewContext.Provider value={contextValue} key={rerenderKey}>
      <div data-view-container={id}>{children}</div>
    </ViewContext.Provider>
  );
};
