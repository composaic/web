import { PluginDescriptor } from '@composaic/core';
import navbarPluginDef from './plugins/navbar/navbar-plugin.json';
import viewsPluginDef from './plugins/views/views-plugin.json';
import * as navbar from './plugins/navbar';
import * as views from './plugins/views';
import { PluginModule } from '@composaic/core';

const pluginsMap = {
    [navbarPluginDef.package + '/' + navbarPluginDef.module]: navbar,
    [viewsPluginDef.package + '/' + viewsPluginDef.module]: views,
};

const loadCorePlugin = async (
    pluginDescriptor: PluginDescriptor
): Promise<object | undefined> => {
    return Promise.resolve(
        pluginsMap[`${pluginDescriptor.package}/${pluginDescriptor.module}`]
    );
};

const getPluginDefinitions = (): PluginDescriptor[] => {
    return [
        { ...navbarPluginDef, loader: loadCorePlugin } as PluginDescriptor,
        { ...viewsPluginDef, loader: loadCorePlugin } as PluginDescriptor,
    ];
};

/**
 * Returns a list of plugin descriptors for the core web plugins.
 *
 * @returns A list of plugin descriptors.
 */

export const getPluginModule = ():PluginModule => ({
    getPluginDefinitions,
    getModuleName: () => '@composaic/web'
});
