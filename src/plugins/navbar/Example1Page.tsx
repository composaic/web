import React, { useEffect, useState } from 'react';
import { ViewsPlugin } from '../views';
import { Plugin, PluginManager } from '@composaic/core';
import { LocalEventBus } from '../views/LocalEventBus';

export const Example1Page: React.FC = () => {
    const [pluginComponents, setPluginComponents] = useState<
        { slot: string; component: React.FC }[]
    >([]);
    const localEventBus = new LocalEventBus();
    localEventBus.on('selectionChanged', (event) => {
        console.log('Selection changed:', event);
    });

    const refreshViews = () => {
        // Assuming PluginManager has a method getPlugin to get a plugin by name
        // and the plugin has a method getViewsByContext to get views by context
        PluginManager.getInstance()
            .getPlugin('@composaic/views')
            .then((viewsPlugin) => {
                if (viewsPlugin) {
                    const { components } =
                        (viewsPlugin as ViewsPlugin).getViewsByContainer(
                            'sample.container'
                        ) || {
                            components: [],
                        };
                    const componentPromises = components.map(
                        ({ component, plugin }) => {
                            return PluginManager.getInstance()
                                .getPlugin(plugin)
                                .then((pluginInstance) => {
                                    if (!pluginInstance) {
                                        return Promise.reject(
                                            new Error(
                                                `Plugin ${plugin} not found`
                                            )
                                        );
                                    }
                                    // Assuming the plugin instance has a method to dynamically import components by identifier
                                    return {
                                        slot: component.slot,
                                        component: pluginInstance.getModule(
                                            component.component
                                        ) as React.FC,
                                    };
                                });
                        }
                    );

                    Promise.all(componentPromises)
                        .then((loadedComponents) => {
                            const filteredComponents = loadedComponents.filter(
                                (component) => component.component !== null
                            );
                            setPluginComponents(filteredComponents);
                        })
                        .catch((error) =>
                            console.error('Error loading components:', error)
                        );
                }
            });
    };

    useEffect(() => {
        refreshViews();
        PluginManager.getInstance().registerPluginChangeListener(
            ['@composaic/views'],
            refreshViews
        );
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <div>
            {/* Render the "master" component */}
            {pluginComponents &&
                pluginComponents
                    .filter((Component) => Component.slot === 'master')
                    .map((Component, index) => (
                        <Component.component
                            key={index}
                            {...{ events: localEventBus }}
                        />
                    ))}

            {/* Render all "detail" components */}
            {pluginComponents &&
                pluginComponents
                    .filter((Component) => Component.slot === 'detail')
                    .map((Component, index) => (
                        <Component.component
                            key={`detail-${index}`}
                            {...{ events: localEventBus }}
                        />
                    ))}
        </div>
    );
};
