import React, { useRef, useEffect } from 'react';
import { LocalEventBus } from '../views/LocalEventBus';
import { ViewContainer } from '../views/components/ViewContainer';
import { ViewComponent } from '../views/components/ViewComponent';

export const Example1Page: React.FC = () => {
  const eventBusRef = useRef<LocalEventBus | null>(null);

  // Initialize EventBus only once
  if (!eventBusRef.current) {
    eventBusRef.current = new LocalEventBus();
  }

  useEffect(() => {
    // Define the event handler
    const handleSelectionChanged = (event: any) => {
      console.log('Selection changed:', event);
    };

    // Register the event handler
    eventBusRef.current?.on('selectionChanged', handleSelectionChanged);

    // Cleanup event handler on unmount
    return () => {
      if (eventBusRef.current) {
        eventBusRef.current.off('selectionChanged', handleSelectionChanged);
        eventBusRef.current = null;
      }
    };
  }, []);

  // Ensure we have an EventBus
  if (!eventBusRef.current) {
    return null;
  }

  return (
    <>
      <div>New Example</div>
      <div>
        <ViewContainer
          context="sample.container"
          eventBus={eventBusRef.current}
        >
          <ViewComponent slot="master" />
          <ViewComponent slot="detail" />
        </ViewContainer>
      </div>
    </>
  );
};
