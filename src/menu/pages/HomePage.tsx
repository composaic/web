import React from 'react';

function componentTiming<
  T extends { new (...args: any[]): React.Component<any, any> },
>(value: T, context: ClassDecoratorContext) {
  context.addInitializer(function () {
    console.log('✨ TS5+ Decorator Test: HomePage component initialized');
  });

  const decorated = class extends value {
    render() {
      console.log('🎯 TS5+ Decorator Test: HomePage render started');
      const start = performance.now();
      const result = super.render();
      const end = performance.now();
      console.log(
        `✨ TS5+ Decorator Test: HomePage render completed in ${(end - start).toFixed(2)}ms`,
      );
      return result;
    }
  } as T;
  return decorated;
}

@componentTiming
class HomePage extends React.Component {
  render() {
    return (
      <div>
        <h1>Home Page</h1>
        <p>This page provides information about us.</p>
      </div>
    );
  }
}

export default HomePage;
