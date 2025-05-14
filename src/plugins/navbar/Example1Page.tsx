import React from 'react';
import { ViewComponent } from '../views/components/ViewComponent';

export const Example1Page: React.FC = () => {
  return (
    <>
      <div>New Example</div>
      <div>
        <ViewComponent id="sample.container">
          <ViewComponent slot="master" />
          <ViewComponent slot="detail" />
        </ViewComponent>
      </div>
    </>
  );
};
