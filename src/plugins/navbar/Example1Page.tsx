import React from 'react';
import { ViewContainer } from '../views/components/ViewContainer';
import { ViewComponent } from '../views/components/ViewComponent';

export const Example1Page: React.FC = () => {
  return (
    <>
      <div>New Example</div>
      <div>
        <ViewContainer id="sample.container">
          <ViewComponent slot="master" />
          <ViewComponent slot="detail" />
        </ViewContainer>
      </div>
    </>
  );
};
