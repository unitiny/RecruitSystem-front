const pages = import.meta.glob('../views/**/*.vue');
const routes = Object.keys(pages).map((path) => {
    const name = path.match(/\.\.\/views\/(.*)\.vue$/)![1].toLowerCase();
    const routePath = `/${name}`;
    return {
        path: routePath,
        name: routePath,
        component: pages[path],
        props: true
    };
});

export default routes