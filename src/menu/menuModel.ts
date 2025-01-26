import React from 'react';
import Service2Page from './pages/Service2Page';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';

// Define a type where component is required and children is omitted
export interface MenuItem {
    id: string;
    mountAt?: string;
    label: string;
    path?: string;
    component?: React.ComponentType;
    children?: MenuItem[];
}

export class MenuModel {
    private static instance: MenuModel;
    private menuItems: MenuItem[];
    private instance: number;

    // Private constructor to prevent direct instantiation
    private constructor() {
        this.menuItems = [];
        this.reset();
        this.instance = new Date().getTime();
    }

    // Static method to get the single instance of the class
    public static getInstance(): MenuModel {
        if (!MenuModel.instance) {
            MenuModel.instance = new MenuModel();
        }
        return MenuModel.instance;
    }

    // Method to get the menu items
    public getMenuItems(): MenuItem[] {
        return [...this.menuItems];
    }

    // Method to reset the menu items
    public reset(): void {
        this.menuItems = [];
        this.menuItems.push({
            id: 'root.Home',
            label: 'Home',
            path: '/',
            component: HomePage,
        });
        this.menuItems.push({
            id: 'root.Services',
            label: 'Services',
            children: [
                {
                    id: 'services.ServiceOne',
                    label: 'Service 1',
                    path: '/service1',
                    component: Service2Page,
                },
                {
                    id: 'services.ServiceTwo',
                    label: 'Service 2',
                    path: '/service2',
                    component: Service2Page,
                },
            ],
        });
        this.menuItems.push({
            id: 'root.About',
            label: 'About',
            path: '/about',
            component: AboutPage,
        });
    }

    // Method to add a new menu item
    public addMenuItem(menuItem: MenuItem): void {
        this.addOrUpdateMenuItem(this.menuItems, menuItem);
        this.deduplicateMenuItems();
    }

    private addOrUpdateMenuItem(
        menuItems: MenuItem[],
        menuItem: MenuItem
    ): void {
        const existingItem = menuItems.find(
            (item) =>
                item.label === menuItem.label && item.path === menuItem.path
        );
        if (existingItem) {
            // If the item exists and is a terminal node, do nothing
            if (!menuItem.children || menuItem.children.length === 0) {
                return;
            }

            // If the item exists and has children, recursively add children
            if (menuItem.children) {
                menuItem.children.forEach((child) => {
                    this.addOrUpdateMenuItem(
                        existingItem.children || (existingItem.children = []),
                        child
                    );
                });
            }
        } else {
            // Add the new menu item if it doesn't exist and return
            menuItems.push(menuItem);
            return;
        }
    }

    private deduplicateMenuItems(): void {
        const seen = new Map<string, MenuItem>();

        const deduplicate = (items: MenuItem[]): MenuItem[] => {
            return items.reduce((acc: MenuItem[], item: MenuItem) => {
                const key = `${item.label}-${item.path ?? ''}`;
                if (seen.has(key)) {
                    const existingItem = seen.get(key)!;
                    if (item.children) {
                        if (!existingItem.children) {
                            existingItem.children = [];
                        }
                        existingItem.children = deduplicate([
                            ...existingItem.children,
                            ...item.children,
                        ]);
                    }
                } else {
                    const newItem = {
                        ...item,
                        children: item.children
                            ? deduplicate(item.children)
                            : undefined,
                    };
                    seen.set(key, newItem);
                    acc.push(newItem);
                }
                return acc;
            }, []);
        };

        this.menuItems = deduplicate(this.menuItems);
    }
}
