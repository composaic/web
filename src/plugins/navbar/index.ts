// Assuming necessary imports based on the LoggerPlugin example
import { Plugin } from '@composaic/core';

// Components exposed by this plugin module
export { Example1Page } from './Example1Page';
export { Example2Page } from './Example2Page';

// Define a hypothetical NavbarItem type for demonstration
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

export class SimpleNavbarExtension implements NavbarExtensionPoint {
    getNavbarItems(): NavbarItem[] {
        return [];
    }
}
