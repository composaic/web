import React from 'react';
import { ViewComponent } from '../views/components/ViewComponent';
import { DynaComponent } from '../views/components/DynaComponent';

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

      {/* Dynamic Component Examples */}
      <div style={{ marginTop: '40px' }}>
        <h2>Dynamic Component Examples</h2>

        <h3>Admin User Card</h3>
        <DynaComponent
          componentId="@demo/user-card"
          props={{
            name: 'John Doe',
            age: 30,
            role: 'admin',
            tags: ['developer', 'typescript', 'react'],
            isActive: true,
          }}
        >
          <p>This is child content passed to the admin user component</p>
        </DynaComponent>

        <h3>Regular User Card</h3>
        <DynaComponent
          componentId="@demo/user-card"
          props={{
            name: 'Jane Smith',
            age: 25,
            role: 'user',
            tags: ['designer', 'ui/ux'],
            isActive: false,
          }}
        >
          <p>This user is currently offline but has great design skills!</p>
        </DynaComponent>

        <h3>Guest User Card (No Age)</h3>
        <DynaComponent
          componentId="@demo/user-card"
          props={{
            name: 'Anonymous Guest',
            role: 'guest',
            tags: ['visitor'],
            isActive: true,
          }}
        >
          <p>Welcome, guest user! Feel free to explore our platform.</p>
        </DynaComponent>
      </div>
    </>
  );
};
