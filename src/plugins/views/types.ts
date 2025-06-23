// Views Plugin Types

export type PluginViewDefinition = {
  container: string;
  components: { slot: string; component: string }[];
  plugin: string;
};

export type ViewDefinition = {
  container: string;
  components: {
    component: { slot: string; component: string };
    plugin: string;
  }[];
};

/**
 * Views extension point.
 */
export interface ViewsExtensionPoint {
  getViewDefinitions(): ViewDefinition[];
}

// Components Plugin Types

export interface ComponentDefinition {
  componentId: string;
  componentClass: string;
  properties: ComponentProperties;
  plugin?: string;
}

export type ComponentProperties = {
  [key: string]: PropertyType;
};

export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | `?${string}` // Optional properties
  | `${string}|${string}` // Union types like 'male|female'
  | `${string}[]`; // Array types

/**
 * Components extension point.
 */
export interface ComponentsExtensionPoint {
  getComponentDefinitions(): ComponentDefinition[];
}

// Validation Types

export interface ValidationResult {
  success: boolean;
  data?: any;
  error?: string;
}
