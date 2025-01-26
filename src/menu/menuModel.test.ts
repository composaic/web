import { MenuModel, MenuItem } from './menuModel';
import HomePage from './pages/HomePage';
import Service2Page from './pages/Service2Page';
import AboutPage from './pages/AboutPage';

describe('MenuModel', () => {
    let menuModel: MenuModel;

    beforeEach(() => {
        menuModel = MenuModel.getInstance();
        menuModel.reset();
    });

    it('should return the default menu items', () => {
        const menuItems = menuModel.getMenuItems();
        expect(menuItems).toHaveLength(3);
        expect(menuItems[0]).toEqual({
            id: 'root.Home',
            label: 'Home',
            path: '/',
            component: HomePage,
        });
        expect(menuItems[1].children).toHaveLength(2);
        expect(menuItems[2]).toEqual({
            id: 'root.About',
            label: 'About',
            path: '/about',
            component: AboutPage,
        });
    });

    it('should add a new menu item', () => {
        const newMenuItem: MenuItem = {
            id: 'root.Contact',
            label: 'Contact',
            path: '/contact',
            component: HomePage,
        };
        menuModel.addMenuItem(newMenuItem);
        const menuItems = menuModel.getMenuItems();
        expect(menuItems).toHaveLength(4);
        expect(menuItems[3]).toEqual(newMenuItem);
    });

    it('should not add duplicate menu items', () => {
        const duplicateMenuItem: MenuItem = {
            id: 'root.Home',
            label: 'Home',
            path: '/',
            component: HomePage,
        };
        menuModel.addMenuItem(duplicateMenuItem);
        const menuItems = menuModel.getMenuItems();
        expect(menuItems).toHaveLength(3);
    });

    it('should add children to existing menu items', () => {
        const newChildMenuItem: MenuItem = {
            id: 'services.ServiceThree',
            label: 'Service 3',
            path: '/service3',
            component: Service2Page,
        };
        const parentMenuItem: MenuItem = {
            id: 'root.Services',
            label: 'Services',
            children: [newChildMenuItem],
        };
        menuModel.addMenuItem(parentMenuItem);
        const menuItems = menuModel.getMenuItems();
        const servicesMenuItem = menuItems.find(
            (item) => item.id === 'root.Services'
        );
        expect(servicesMenuItem?.children).toHaveLength(3);
        expect(servicesMenuItem?.children?.[2]).toEqual(newChildMenuItem);
    });

    it('should deduplicate menu items', () => {
        const duplicateChildMenuItem: MenuItem = {
            id: 'services.ServiceTwo',
            label: 'Service 2',
            path: '/service2',
            component: Service2Page,
        };
        const parentMenuItem: MenuItem = {
            id: 'root.Services',
            label: 'Services',
            children: [duplicateChildMenuItem],
        };
        menuModel.addMenuItem(parentMenuItem);
        const menuItems = menuModel.getMenuItems();
        const servicesMenuItem = menuItems.find(
            (item) => item.id === 'root.Services'
        );
        expect(servicesMenuItem?.children).toHaveLength(2);
    });
    it('should correctly dedup items', () => {
        const item1: MenuItem = {
            id: 'root.Examples',
            label: 'Examples',
            mountAt: 'root.Profile',
            children: [
                {
                    id: 'root.Examples.Example1',
                    label: 'Example 1',
                    path: '/example1',
                    component: AboutPage,
                },
                {
                    id: 'root.Examples.Example2',
                    label: 'Example 2',
                    path: '/example2',
                    component: AboutPage,
                },
            ],
        };
        const item2: MenuItem = {
            id: 'test.RemoteExamples',
            label: 'Remote Examples',
            mountAt: 'root.Profile',
            children: [
                {
                    id: 'test.RemoteExamples.RemoteExample',
                    label: 'Remote Example',
                    path: '/remoteexample',
                    component: AboutPage,
                },
            ],
        };
        const item3: MenuItem = {
            id: 'test.RemoteExamples',
            label: 'Remote Examples',
            mountAt: 'root.Profile',
            children: [
                {
                    id: 'test.RemoteExamples.RemoteExample',
                    label: 'Test Plugin One',
                    path: '/remoteexample1',
                    component: AboutPage,
                },
            ],
        };
        menuModel.addMenuItem(item1);
        menuModel.addMenuItem(item2);
        menuModel.addMenuItem(item3);
        const menuItems = menuModel.getMenuItems();
        expect(menuItems).toHaveLength(5);
        const remoteExamples = menuItems.find(
            (item) => item.label === 'Remote Examples'
        );
        expect(remoteExamples?.children).toHaveLength(2);
        expect(remoteExamples?.children?.[1]?.label).toEqual('Test Plugin One');
        expect(remoteExamples?.children?.[0]?.label).toEqual('Remote Example');
    });
});
