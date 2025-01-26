import React, { JSX, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { PluginManager } from '@composaic/core';
import { NavbarItem, NavbarPlugin } from '../plugins/navbar';
import { MenuItem, MenuModel } from './menuModel'; // Import the MenuItemModel and menuItems
import PluginComponentPage from './PluginComponentPage';

export const transformNavBarItemsToMenuItems = (
    navBarItems: NavbarItem[],
    plugin?: string
): MenuItem[] => {
    return navBarItems.map((item: NavbarItem): MenuItem => {
        // Base transformation for items without children
        // const LazyComponent = React.lazy(
        //     () => import(`./PluginComponentPage.js`)
        // );
        // Create a wrapper component to pass props to the lazy-loaded component
        const ComponentWithProps = () => (
            <Suspense fallback={<div>Loading...</div>}>
                <PluginComponentPage
                    component={item.component}
                    plugin={plugin || item.plugin}
                />
            </Suspense>
        );

        const menuItem: MenuItem = {
            id: item.id,
            label: item.label,
            path: item.path,
            component: item.component ? ComponentWithProps : undefined,
            children: item.children
                ? transformNavBarItemsToMenuItems(item.children, item.plugin)
                : undefined,
        };
        return menuItem;
    });
};

// Update the generateRoutes function to use the MenuItemModel type
export const generateRoutes = (items: MenuItem[]): JSX.Element[] => {
    return items
        .flatMap((item, index) => [
            item.component ? (
                <Route
                    key={index}
                    path={item.path}
                    element={<item.component />} //React.createElement(item.component)}
                />
            ) : null,
            item.children ? generateRoutes(item.children) : null,
        ])
        .filter(Boolean) as JSX.Element[];
};

export const getRoutes = async () => {
    const navBarPlugin =
        await PluginManager.getInstance().getPlugin('@composaic/navbar');
    const navbarItems = (navBarPlugin as NavbarPlugin).getNavbarItems();
    const items = transformNavBarItemsToMenuItems(navbarItems);
    for (const item of items) {
        MenuModel.getInstance().addMenuItem(item);
    }
    const routes = generateRoutes(MenuModel.getInstance().getMenuItems());
    return routes;
};
