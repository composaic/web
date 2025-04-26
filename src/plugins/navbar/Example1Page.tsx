import React from 'react';
import { LocalEventBus } from '../views/LocalEventBus';
import { ViewContainer } from '../views/components/ViewContainer';
import { ViewComponent } from '../views/components/ViewComponent';

export const Example1Page: React.FC = () => {
  const localEventBus = new LocalEventBus();
  localEventBus.on('selectionChanged', (event) => {
    console.log('Selection changed:', event);
  });

  return (
    <>
      <div>New Example</div>
      <div>
        <ViewContainer context="sample.container" eventBus={localEventBus}>
          <ViewComponent slot="master" />
          <ViewComponent slot="detail" />
        </ViewContainer>
      </div>
    </>
  );
};
