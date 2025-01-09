import React from 'react';
import { render } from '@testing-library/react';
import { MyComponent } from './index';

test('renders MyComponent', () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText('Hello, world!')).toBeInTheDocument();
});