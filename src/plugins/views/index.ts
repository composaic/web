import { Plugin, PluginMetadata, ExtensionMetadata } from '@composaic/core';

export { SampleViewComponent } from './SampleViewComponent';

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
  ],
})
export class ViewsPlugin extends Plugin {
  private viewsDefinitons: ViewDefinition[] = [];

  async start() {
    console.log('[ViewsPlugin] Starting plugin initialization');
    super.start();
    await this.initializeViews();
    console.log('[ViewsPlugin] Plugin initialization complete');
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

  async stop() {
    console.log('[ViewsPlugin] Stopping plugin');
    this.viewsDefinitons = [];
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
