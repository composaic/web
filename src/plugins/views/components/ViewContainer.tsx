import React from 'react';
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
  return (
    <ViewContext.Provider value={{ context, eventBus }}>
      {children}
    </ViewContext.Provider>
  );
};
