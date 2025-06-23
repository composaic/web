import { Plugin, PluginMetadata, ExtensionMetadata } from '@composaic/core';
import {
  ViewsExtensionPoint,
  ComponentsExtensionPoint,
  ViewDefinition,
  PluginViewDefinition,
  ComponentDefinition,
  ValidationResult,
} from './types';
import { ComponentTypeValidator } from './validation/ComponentTypeValidator';

export { SampleViewComponent } from './SampleViewComponent';
export { DynaComponent } from './components/DynaComponent';

// Re-export types for external use
export type {
  ViewsExtensionPoint,
  ComponentsExtensionPoint,
  ViewDefinition,
  PluginViewDefinition,
  ComponentDefinition,
  ValidationResult,
} from './types';

@PluginMetadata({
  plugin: '@composaic/views',
  version: '0.1.0',
  description: 'Views Plugin',
  module: 'index',
  package: 'views',
  extensionPoints: [
    {
      id: 'views',
      type: 'ViewsExtensionPoint',
    },
    {
      id: 'components',
      type: 'ComponentsExtensionPoint',
    },
  ],
})
export class ViewsPlugin extends Plugin {
  private viewsDefinitons: ViewDefinition[] = [];
  private componentDefinitions: ComponentDefinition[] = [];
  private typeValidator: ComponentTypeValidator;

  constructor() {
    super();
    this.typeValidator = new ComponentTypeValidator();
  }

  async start() {
    console.log('🔵 VIEWS_DEBUG: Plugin start() called');
    super.start();
    await this.initializeViews();
    await this.initializeComponents();

    console.log(
      '🔵 VIEWS_DEBUG: Final state - Views:',
      this.viewsDefinitons.length,
      'Components:',
      this.componentDefinitions.length,
    );
  }

  private async initializeViews() {
    console.log('[ViewsPlugin] Beginning view initialization');

    // Collect views definitions from all connected extensions
    const pluginViewsDefinitons: PluginViewDefinition[] = [];
    const extensions = this.getConnectedExtensions('views');
    console.log('[ViewsPlugin] Found connected extensions:', extensions);

    extensions.forEach((extension) => {
      console.log('[ViewsPlugin] Processing extension:', extension.plugin);
      const navBarMeta = extension.meta! as PluginViewDefinition[];
      for (const item of navBarMeta) {
        console.log('[ViewsPlugin] Processing view definition:', item);
        item.plugin = extension.plugin;
        pluginViewsDefinitons.push(item);
      }
    });

    this.viewsDefinitons = this.consolidateViews(pluginViewsDefinitons);
    console.log('[ViewsPlugin] Final view definitions:', this.viewsDefinitons);
  }

  consolidateViews(
    pluginViewDefinitions: PluginViewDefinition[],
  ): ViewDefinition[] {
    console.log('[ViewsPlugin] Consolidating view definitions');
    const viewDefinitions: ViewDefinition[] = [];

    pluginViewDefinitions.forEach((pluginViewDefinition) => {
      const existingViewDefinition = viewDefinitions.find(
        (viewDefinition) =>
          viewDefinition.container === pluginViewDefinition.container,
      );

      if (existingViewDefinition) {
        console.log(
          '[ViewsPlugin] Adding components to existing container:',
          pluginViewDefinition.container,
        );
        pluginViewDefinition.components.forEach((component) => {
          console.log('[ViewsPlugin] Adding component:', component);
          existingViewDefinition.components.push({
            component: component,
            plugin: pluginViewDefinition.plugin,
          });
        });
      } else {
        console.log(
          '[ViewsPlugin] Creating new container:',
          pluginViewDefinition.container,
        );
        viewDefinitions.push({
          container: pluginViewDefinition.container,
          components: pluginViewDefinition.components.map((component) => ({
            component,
            plugin: pluginViewDefinition.plugin,
          })),
        });
      }
    });

    console.log(
      '[ViewsPlugin] Consolidated view definitions:',
      viewDefinitions,
    );
    return viewDefinitions;
  }

  private async initializeComponents() {
    console.log('🔵 COMP_DEBUG: initializeComponents() called');

    // Clear existing component definitions to avoid duplicates
    this.componentDefinitions = [];

    // Collect component definitions from all connected extensions
    const extensions = this.getConnectedExtensions('components');
    console.log('🔵 COMP_DEBUG: Found extensions:', extensions?.length || 0);

    if (extensions && extensions.length > 0) {
      extensions.forEach((extension) => {
        const componentMeta = extension.meta! as ComponentDefinition[];
        if (componentMeta && Array.isArray(componentMeta)) {
          for (const component of componentMeta) {
            component.plugin = extension.plugin;
            this.componentDefinitions.push(component);
          }
        }
      });
    }

    console.log(
      '🔵 COMP_DEBUG: Final components:',
      this.componentDefinitions.length,
    );
    console.log(
      '🔵 COMP_DEBUG: Component IDs:',
      this.componentDefinitions.map((def) => def.componentId),
    );
  }

  async stop() {
    console.log('[ViewsPlugin] Stopping plugin');
    this.viewsDefinitons = [];
    this.componentDefinitions = [];
  }

  public getViewsByContainer(container: string): ViewDefinition | undefined {
    console.log('[ViewsPlugin] Getting views for container:', container);
    console.log(
      '[ViewsPlugin] Current view definitions:',
      this.viewsDefinitons,
    );

    const views = this.viewsDefinitons.find(
      (viewDefinition) => viewDefinition.container === container,
    );

    console.log('[ViewsPlugin] Found views for container:', views);
    return views;
  }

  public getComponentById(
    componentId: string,
  ): ComponentDefinition | undefined {
    const component = this.componentDefinitions.find(
      (def) => def.componentId === componentId,
    );

    console.log(
      '🔵 COMP_DEBUG: getComponentById:',
      componentId,
      component ? '✅ FOUND' : '❌ NOT FOUND',
    );
    return component;
  }

  public getAllComponents(): ComponentDefinition[] {
    console.log(
      '[ViewsPlugin] getAllComponents called, returning:',
      this.componentDefinitions,
    );
    return this.componentDefinitions;
  }

  public validateProps(componentId: string, props: any): ValidationResult {
    const component = this.getComponentById(componentId);
    if (!component) {
      return { success: false, error: `Component not found: ${componentId}` };
    }

    return this.typeValidator.validate(component.properties, props);
  }
}

@ExtensionMetadata({
  plugin: 'self',
  id: 'views',
  className: 'SimpleViewsExtension',
  meta: [
    {
      container: 'sample.container',
      components: [
        {
          slot: 'master',
          component: 'SampleViewComponent',
        },
      ],
    },
  ],
})
export class SimpleViewsExtension implements ViewsExtensionPoint {
  getViewDefinitions(): ViewDefinition[] {
    console.log('[SimpleViewsExtension] Getting view definitions');
    const viewDefinitions = [
      {
        container: 'sample.container',
        components: [
          {
            component: {
              slot: 'master',
              component: 'SampleViewComponent',
            },
            plugin: '@composaic/views',
          },
        ],
      },
    ];
    console.log(
      '[SimpleViewsExtension] Returning view definitions:',
      viewDefinitions,
    );
    return viewDefinitions;
  }
}
