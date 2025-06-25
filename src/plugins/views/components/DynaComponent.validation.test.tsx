import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynaComponent } from './DynaComponent';
import { PluginManager } from '@composaic/core';

// Mock PluginManager
jest.mock('@composaic/core', () => ({
  PluginManager: {
    getInstance: jest.fn(),
  },
}));

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  jest.clearAllMocks();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('DynaComponent Validation Tests', () => {
  const mockViewsPlugin = {
    getComponentById: jest.fn(),
    validateProps: jest.fn(),
  };

  const mockPluginInstance = {
    getModule: jest.fn(),
  };

  const mockPluginManager = {
    getPlugin: jest.fn(),
    registerPluginChangeListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
  };

  beforeEach(() => {
    (PluginManager.getInstance as jest.Mock).mockReturnValue(mockPluginManager);
    mockPluginManager.getPlugin.mockImplementation((pluginId: string) => {
      if (pluginId === '@composaic/views') {
        return Promise.resolve(mockViewsPlugin);
      }
      if (pluginId === '@test/plugin') {
        return Promise.resolve(mockPluginInstance);
      }
      return Promise.resolve(null);
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Component ID Validation', () => {
    it('should handle empty componentId gracefully', async () => {
      render(<DynaComponent componentId="" />);

      // Should not attempt to load anything
      await waitFor(() => {
        expect(mockViewsPlugin.getComponentById).not.toHaveBeenCalled();
      });
    });

    it('should start loading for valid componentId', async () => {
      render(<DynaComponent componentId="test-component" />);

      // Should show loading state initially
      expect(screen.getByText('Loading component...')).toBeInTheDocument();

      // Should attempt to get component definition
      await waitFor(() => {
        expect(mockViewsPlugin.getComponentById).toHaveBeenCalledWith(
          'test-component',
        );
      });
    });
  });

  describe('Props Validation', () => {
    const mockComponentDef = {
      componentId: '@test/user-card',
      componentClass: 'UserCardComponent',
      plugin: '@test/plugin',
      properties: {
        name: 'string',
        age: '?number',
        role: 'admin|user|guest',
        tags: 'string[]',
        isActive: 'boolean',
      },
    };

    beforeEach(() => {
      mockViewsPlugin.getComponentById.mockReturnValue(mockComponentDef);
      mockPluginInstance.getModule.mockReturnValue(() =>
        React.createElement('div', {}, 'Mock Component'),
      );
    });

    it('should validate valid props successfully', async () => {
      const validProps = {
        name: 'John Doe',
        age: 30,
        role: 'admin',
        tags: ['developer', 'react'],
        isActive: true,
      };

      mockViewsPlugin.validateProps.mockReturnValue({
        success: true,
        data: validProps,
      });

      render(
        <DynaComponent componentId="@test/user-card" props={validProps} />,
      );

      await waitFor(() => {
        expect(mockViewsPlugin.validateProps).toHaveBeenCalledWith(
          '@test/user-card',
          validProps,
        );
        expect(screen.getByText('Mock Component')).toBeInTheDocument();
      });
    });

    it('should handle invalid string prop type', async () => {
      const invalidProps = {
        name: 123, // Should be string
        role: 'admin',
        isActive: true,
      };

      mockViewsPlugin.validateProps.mockReturnValue({
        success: false,
        error: 'name: Expected string, received number',
      });

      render(
        <DynaComponent componentId="@test/user-card" props={invalidProps} />,
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Error loading component: Invalid props: name: Expected string, received number/,
          ),
        ).toBeInTheDocument();
      });
    });

    it('should handle invalid union type prop', async () => {
      const invalidProps = {
        name: 'John Doe',
        role: 'invalid-role', // Should be admin|user|guest
        isActive: true,
      };

      mockViewsPlugin.validateProps.mockReturnValue({
        success: false,
        error:
          'role: Invalid literal value, expected "admin" | "user" | "guest"',
      });

      render(
        <DynaComponent componentId="@test/user-card" props={invalidProps} />,
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Error loading component: Invalid props: role: Invalid literal value/,
          ),
        ).toBeInTheDocument();
      });
    });

    it('should handle multiple validation errors', async () => {
      const invalidProps = {
        name: 123, // Should be string
        role: 'invalid', // Should be admin|user|guest
        isActive: 'yes', // Should be boolean
      };

      mockViewsPlugin.validateProps.mockReturnValue({
        success: false,
        error:
          'name: Expected string, received number; role: Invalid literal value; isActive: Expected boolean, received string',
      });

      render(
        <DynaComponent componentId="@test/user-card" props={invalidProps} />,
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Error loading component: Invalid props:.*name:.*role:.*isActive:/,
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Plugin Loading Validation', () => {
    const mockComponentDef = {
      componentId: '@test/user-card',
      componentClass: 'UserCardComponent',
      plugin: '@test/plugin',
      properties: { name: 'string' },
    };

    beforeEach(() => {
      mockViewsPlugin.getComponentById.mockReturnValue(mockComponentDef);
      mockViewsPlugin.validateProps.mockReturnValue({
        success: true,
        data: {},
      });
    });

    it('should attempt to load views plugin', async () => {
      render(<DynaComponent componentId="@test/user-card" />);

      // Should show loading state initially
      expect(screen.getByText('Loading component...')).toBeInTheDocument();

      // Should attempt to get views plugin
      await waitFor(() => {
        expect(mockPluginManager.getPlugin).toHaveBeenCalledWith(
          '@composaic/views',
        );
      });
    });

    it('should call plugin manager for component plugin', async () => {
      render(<DynaComponent componentId="@test/user-card" />);

      // Should show loading state initially
      expect(screen.getByText('Loading component...')).toBeInTheDocument();

      // Should attempt to get component plugin
      await waitFor(() => {
        expect(mockPluginManager.getPlugin).toHaveBeenCalledWith(
          '@test/plugin',
        );
      });
    });

    it('should call getModule on plugin instance', async () => {
      render(<DynaComponent componentId="@test/user-card" />);

      // Should show loading state initially
      expect(screen.getByText('Loading component...')).toBeInTheDocument();

      // Should attempt to get module from plugin
      await waitFor(() => {
        expect(mockPluginInstance.getModule).toHaveBeenCalledWith(
          'UserCardComponent',
        );
      });
    });
  });

  describe('End-to-End Component Loading', () => {
    it('should successfully load and render a simple component', async () => {
      const SimpleComponent = ({ name }: { name: string }) => (
        <div data-testid="simple-component">Hello, {name}!</div>
      );

      const componentDef = {
        componentId: '@test/simple-card',
        componentClass: 'SimpleComponent',
        plugin: '@test/plugin',
        properties: { name: 'string' },
      };

      mockViewsPlugin.getComponentById.mockReturnValue(componentDef);
      mockViewsPlugin.validateProps.mockReturnValue({
        success: true,
        data: { name: 'John' },
      });
      mockPluginInstance.getModule.mockReturnValue(SimpleComponent);

      render(
        <DynaComponent
          componentId="@test/simple-card"
          props={{ name: 'John' }}
        />,
      );

      // Should start with loading state
      expect(screen.getByText('Loading component...')).toBeInTheDocument();

      // Should eventually render the actual component
      await waitFor(() => {
        expect(screen.getByTestId('simple-component')).toBeInTheDocument();
        expect(screen.getByText('Hello, John!')).toBeInTheDocument();
      });

      // Loading state should be gone
      expect(
        screen.queryByText('Loading component...'),
      ).not.toBeInTheDocument();
    });

    it('should load and render a complex component with multiple props', async () => {
      const UserCard = ({
        name,
        age,
        role,
        isActive,
      }: {
        name: string;
        age: number;
        role: string;
        isActive: boolean;
      }) => (
        <div data-testid="user-card">
          <h2 data-testid="user-name">{name}</h2>
          <p data-testid="user-age">Age: {age}</p>
          <p data-testid="user-role">Role: {role}</p>
          <span data-testid="user-status">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      );

      const componentDef = {
        componentId: '@test/user-card',
        componentClass: 'UserCard',
        plugin: '@test/plugin',
        properties: {
          name: 'string',
          age: 'number',
          role: 'admin|user|guest',
          isActive: 'boolean',
        },
      };

      const props = {
        name: 'Alice Smith',
        age: 30,
        role: 'admin',
        isActive: true,
      };

      mockViewsPlugin.getComponentById.mockReturnValue(componentDef);
      mockViewsPlugin.validateProps.mockReturnValue({
        success: true,
        data: props,
      });
      mockPluginInstance.getModule.mockReturnValue(UserCard);

      render(<DynaComponent componentId="@test/user-card" props={props} />);

      // Should eventually render the complex component with all props
      await waitFor(() => {
        expect(screen.getByTestId('user-card')).toBeInTheDocument();
        expect(screen.getByTestId('user-name')).toHaveTextContent(
          'Alice Smith',
        );
        expect(screen.getByTestId('user-age')).toHaveTextContent('Age: 30');
        expect(screen.getByTestId('user-role')).toHaveTextContent(
          'Role: admin',
        );
        expect(screen.getByTestId('user-status')).toHaveTextContent('Active');
      });
    });

    it('should handle component updates when props change', async () => {
      const Counter = ({ count }: { count: number }) => (
        <div data-testid="counter">Count: {count}</div>
      );

      const componentDef = {
        componentId: '@test/counter',
        componentClass: 'Counter',
        plugin: '@test/plugin',
        properties: { count: 'number' },
      };

      mockViewsPlugin.getComponentById.mockReturnValue(componentDef);
      mockViewsPlugin.validateProps.mockReturnValue({
        success: true,
        data: { count: 5 },
      });
      mockPluginInstance.getModule.mockReturnValue(Counter);

      const { rerender } = render(
        <DynaComponent componentId="@test/counter" props={{ count: 5 }} />,
      );

      // Should render initial count
      await waitFor(() => {
        expect(screen.getByTestId('counter')).toHaveTextContent('Count: 5');
      });

      // Update props and validate new props
      mockViewsPlugin.validateProps.mockReturnValue({
        success: true,
        data: { count: 10 },
      });

      rerender(
        <DynaComponent componentId="@test/counter" props={{ count: 10 }} />,
      );

      // Should render updated count
      await waitFor(() => {
        expect(screen.getByTestId('counter')).toHaveTextContent('Count: 10');
      });
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should accept custom fallback component prop', async () => {
      const CustomFallback = ({ error }: { error: string }) => (
        <div data-testid="custom-fallback">Custom Error: {error}</div>
      );

      render(
        <DynaComponent
          componentId="test-component"
          fallback={CustomFallback}
        />,
      );

      // Should show loading state initially (fallback not used yet)
      expect(screen.getByText('Loading component...')).toBeInTheDocument();

      // Component should accept the fallback prop without errors
      expect(screen.queryByTestId('custom-fallback')).not.toBeInTheDocument();
    });

    it('should handle validation errors with custom fallback', async () => {
      const CustomFallback = ({ error }: { error: string }) => (
        <div data-testid="validation-error">Validation Failed: {error}</div>
      );

      const mockComponentDef = {
        componentId: '@test/user-card',
        componentClass: 'UserCardComponent',
        plugin: '@test/plugin',
        properties: { name: 'string' },
      };

      mockViewsPlugin.getComponentById.mockReturnValue(mockComponentDef);
      mockViewsPlugin.validateProps.mockReturnValue({
        success: false,
        error: 'name: Expected string, received number',
      });

      render(
        <DynaComponent
          componentId="@test/user-card"
          props={{ name: 123 }}
          fallback={CustomFallback}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toBeInTheDocument();
        expect(
          screen.getByText(
            /Validation Failed: Invalid props: name: Expected string, received number/,
          ),
        ).toBeInTheDocument();
      });
    });
  });
});
