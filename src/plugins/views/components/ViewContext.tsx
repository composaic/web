import React from 'react';
import { LocalEventBus } from '../LocalEventBus';

export interface ViewContextType {
  context: string;
  eventBus?: LocalEventBus;
}

export const ViewContext = React.createContext<ViewContextType>({
  context: '',
});
