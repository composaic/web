import React, { JSX } from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { Configuration, init, PluginDescriptor } from '@composaic/core';
import { getPluginModule as getWebPluginModule } from '../index';

import { Navbar } from '../menu/Navbar';
import { getRoutes } from '../menu/menu-utils';
import ErrorBoundary from './ErrorBoundary';
import { addLocalPlugins } from '@composaic/core';

interface DevContainerProps {
    loadModule(pluginDescriptor: PluginDescriptor): Promise<object | undefined>;
    config: Configuration;
}

export const DevContainer = ({
    loadModule,
    config,
}: DevContainerProps) => {
    const [routes, setRoutes] = useState<JSX.Element[]>([]);
    const menuItemsLoaded = useRef(false);

    useEffect(() => {
        if (!menuItemsLoaded.current) {
            menuItemsLoaded.current = true;
            init({
                getPluginModules: () => [getWebPluginModule()],
                addLocalPlugins: async () => {
                    await addLocalPlugins(loadModule);
                },
                // FIXME: remote module loading in dev container not supported as yet
                loadRemoteModule: async () => Promise.resolve({}),
                config,
            })
                .then(() => {
                    getRoutes().then((generatedRoutes) => {
                        setRoutes(generatedRoutes);
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, []);

    return (
        <BrowserRouter>
            <div>
                <Navbar />
                <ErrorBoundary fallback={<div>Something went wrong</div>}>
                    <Routes>{routes}</Routes>
                </ErrorBoundary>
            </div>
        </BrowserRouter>
    );
};
