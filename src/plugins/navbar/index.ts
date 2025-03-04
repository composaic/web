import { Plugin, PluginMetadata, ExtensionMetadata } from '@composaic/core';

// Components exposed by this plugin module
export { Example1Page } from './Example1Page';
export { Example2Page } from './Example2Page';

// Define NavbarItem type
export type NavbarItem = {
    id: string;
    mountAt?: string;
    label: string;
    path: string;
    component: string;
    children: NavbarItem[];
    plugin: string;
};

/**
 * Navbar extension point.
 *
 * Extensions for this extension point will need to implement these methods.
 */
export interface NavbarExtensionPoint {
    getNavbarItems(): NavbarItem[];
}

@PluginMetadata({
    plugin: '@composaic/navbar',
    version: '0.1.0',
    description: 'Navbar Plugin',
    module: 'index',
    package: 'navbar',
    extensionPoints: [{
        id: 'navbarItem',
        type: 'NavbarExtensionPoint'
    }]
})
export class NavbarPlugin extends Plugin {
    private navbarItems: NavbarItem[] = [];

    async start() {
        super.start();
        // Collect navbar items from all connected extensions
        this.navbarItems = [];
        this.getConnectedExtensions('navbarItem').forEach((extension) => {
            const navBarMeta = extension.meta! as NavbarItem[];
            for (const item of navBarMeta) {
                const clonedItem = structuredClone(item);
                clonedItem.plugin = extension.plugin;
                this.navbarItems.push(clonedItem);
            }
        });
        this.mountItems();
    }

    mountItems() {
        // Temporary array to hold items that need to be removed after reassignment
        const itemsToRemove: NavbarItem[] = [];

        this.navbarItems.forEach((item) => {
            if (item.mountAt) {
                // Find the parent item by the mountAt (id) attribute
                const parentItem = this.navbarItems.find(
                    (parent) => parent.id === item.mountAt
                );

                if (parentItem) {
                    // Initialize children array if it doesn't exist
                    if (!parentItem.children) {
                        parentItem.children = [];
                    }
                    // Add the current item as a child of the found parent item
                    parentItem.children.push(item);
                    // Mark the current item for removal from the main array
                    itemsToRemove.push(item);
                } else {
                    // Log error if no matching parent item is found
                    console.error(
                        `Error: No element found with id '${item.mountAt}' to mount '${item.label}'`
                    );
                }
            }
        });

        // Remove items that have been reassigned to a parent from the main array
        this.navbarItems = this.navbarItems.filter(
            (item) => !itemsToRemove.includes(item)
        );
    }

    async stop() {
        // Clear navbar items or any other cleanup
        this.navbarItems = [];
    }

    public getNavbarItems(): NavbarItem[] {
        return [...this.navbarItems];
    }
}

@ExtensionMetadata({
    plugin: 'self',
    id: 'navbarItem',
    className: 'SimpleNavbarExtension',
    meta: [
        {
            id: 'root.Examples',
            mountAt: 'root.Profile',
            label: 'Examples',
            children: [
                {
                    label: 'Example 1',
                    path: '/example1',
                    component: 'Example1Page'
                },
                {
                    label: 'Example 2',
                    path: '/example2',
                    component: 'Example2Page'
                }
            ]
        },
        {
            id: 'root.Profile',
            label: 'Profile',
            children: []
        }
    ]
})
export class SimpleNavbarExtension implements NavbarExtensionPoint {
    getNavbarItems(): NavbarItem[] {
        return [];
    }
}
