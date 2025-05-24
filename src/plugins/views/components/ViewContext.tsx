import React from 'react';

export interface ViewMessage {
  type: string;
  payload: any;
}

export interface ViewContextValue {
  emit: (msg: ViewMessage) => void;
  on: (handler: (msg: ViewMessage) => void) => () => void;
}

export const ViewContext = React.createContext<ViewContextValue | null>(null);

export const useViewContext = () => {
  const context = React.useContext(ViewContext);
  if (!context) {
    throw new Error('useViewContext must be used within ViewContainer');
  }
  return context;
};
