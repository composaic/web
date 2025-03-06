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
    extensionPoints: [{
        id: 'views',
        type: 'ViewsExtensionPoint'
    }]
})
export class ViewsPlugin extends Plugin {
    private viewsDefinitons: ViewDefinition[] = [];

    async start() {
        super.start();
        // Collect views definitions from all connected extensions
        const pluginViewsDefinitons: PluginViewDefinition[] = [];
        this.getConnectedExtensions('views').forEach((extension) => {
            const navBarMeta = extension.meta! as PluginViewDefinition[];
            for (const item of navBarMeta) {
                item.plugin = extension.plugin;
                pluginViewsDefinitons.push(item);
            }
        });
        this.viewsDefinitons = this.consolidateViews(pluginViewsDefinitons);
    }

    consolidateViews(pluginViewDefinitions: PluginViewDefinition[]): ViewDefinition[] {
        const viewDefinitions: ViewDefinition[] = [];
        pluginViewDefinitions.forEach((pluginViewDefinition) => {
            const existingViewDefinition = viewDefinitions.find(
                (viewDefinition) =>
                    viewDefinition.container === pluginViewDefinition.container
            );
            if (existingViewDefinition) {
                pluginViewDefinition.components.forEach((component) => {
                    existingViewDefinition.components.push({
                        component: component,
                        plugin: pluginViewDefinition.plugin,
                    });
                });
            } else {
                viewDefinitions.push({
                    container: pluginViewDefinition.container,
                    components: pluginViewDefinition.components.map(
                        (component) => ({
                            component,
                            plugin: pluginViewDefinition.plugin,
                        })
                    ),
                });
            }
        });
        return viewDefinitions;
    }

    async stop() {
        this.viewsDefinitons = [];
    }

    public getViewsByContainer(container: string): ViewDefinition | undefined {
        return this.viewsDefinitons.find(
            (viewDefinition) => viewDefinition.container === container
        );
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
                    component: 'SampleViewComponent'
                }
            ]
        }
    ]
})
export class SimpleViewsExtension implements ViewsExtensionPoint {
    getViewDefinitions(): ViewDefinition[] {
        return [];
    }
}
