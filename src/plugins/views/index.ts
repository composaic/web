import { Plugin } from '@composaic/core';

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

/**
 * Represents a plugin that manages views in the application.
 */
export class ViewsPlugin extends Plugin {
    private viewsDefinitons: ViewDefinition[] = [];

    async start() {
        super.start();
        // Collect navbar items from all connected extensions
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

    consolidateViews(
        pluginViewDefinitions: PluginViewDefinition[]
    ): ViewDefinition[] {
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
        // Clear navbar items or any other cleanup
        this.viewsDefinitons = [];
    }

    /**
     * Retrieves the view definition for the specified container.
     * @param container - The container name.
     * @returns The view definition for the specified container, or undefined if not found.
     */
    public getViewsByContainer(container: string): ViewDefinition | undefined {
        return this.viewsDefinitons.find(
            (viewDefinition) => viewDefinition.container === container
        );
    }
}

// TODO: This is unnecessary as the information is provided by the manifest
export class SimpleViewsExtension implements ViewsExtensionPoint {
    getViewDefinitions(): ViewDefinition[] {
        return [];
    }
}
