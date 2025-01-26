import { PluginViewDefinition, ViewDefinition, ViewsPlugin } from '.';

describe('ViewsPlugin', () => {
    describe('consolidateViews', () => {
        it('should consolidate plugin view definitions', () => {
            const pluginViewDefinitions: PluginViewDefinition[] = [
                {
                    container: 'container1',
                    components: [
                        { slot: 'main', component: 'component1' },
                        { slot: 'main', component: 'component2' },
                    ],
                    plugin: 'plugin1',
                },
                {
                    container: 'container2',
                    components: [{ slot: 'footer', component: 'component3' }],
                    plugin: 'plugin2',
                },
                {
                    container: 'container1',
                    components: [{ slot: 'slave', component: 'component4' }],
                    plugin: 'plugin3',
                },
            ];

            const expectedViewDefinitions: ViewDefinition[] = [
                {
                    container: 'container1',
                    components: [
                        {
                            component: {
                                slot: 'main',
                                component: 'component1',
                            },
                            plugin: 'plugin1',
                        },
                        {
                            component: {
                                slot: 'main',
                                component: 'component2',
                            },
                            plugin: 'plugin1',
                        },
                        {
                            component: {
                                slot: 'slave',
                                component: 'component4',
                            },
                            plugin: 'plugin3',
                        },
                    ],
                },
                {
                    container: 'container2',
                    components: [
                        {
                            component: {
                                slot: 'footer',
                                component: 'component3',
                            },
                            plugin: 'plugin2',
                        },
                    ],
                },
            ];

            const viewsPlugin = new ViewsPlugin();
            const consolidatedViews = viewsPlugin.consolidateViews(
                pluginViewDefinitions
            );

            expect(consolidatedViews).toEqual(expectedViewDefinitions);
        });
    });
});
