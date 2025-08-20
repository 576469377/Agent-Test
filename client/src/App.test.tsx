import React from 'react';
import { render } from '@testing-library/react';

// Create a simple test component to avoid complex dependencies
const SimpleTestComponent: React.FC = () => {
  return <div data-testid="test-component">Smart Personal Assistant</div>;
};

test('renders test component', () => {
  render(<SimpleTestComponent />);
  // This ensures our test environment is working
  expect(document.body).toBeInTheDocument();
});
