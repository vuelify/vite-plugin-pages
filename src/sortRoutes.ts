import { RouteObject } from '.';
import { ClassCase } from './utils';

function buildLayoutRoute(route: RouteObject) {
  const { layout, path, base } = route;

  const x = '(?<=^).*?(?<=/layouts/)';

  const Reg = new RegExp(x, 'g');

  return {
    name: ClassCase(`${base}-${layout.replace(Reg, '')}Layout`),
    path,
    component: `${layout}.vue`,
    children: [route],
  };
}

export function sortRoutes(routes: RouteObject[]) {
  const baseRoutes = routes.filter(
    (route: RouteObject) => route.path === `/${route.base}` || !route.isChild,
  );

  const intialBaseRoutes = baseRoutes.map((route: RouteObject) => {
    return {
      ...route,
      isChild: undefined,
      filePath: undefined,
      children: routes
        .filter((child: RouteObject) => route.path !== child.path && child.base === route.base)
        .map((child: RouteObject) => ({
          ...child,
          isChild: undefined,
        })),
    };
  });

  const parentRoutes = intialBaseRoutes.map((route) => route.base);

  const orphanRoutes = routes.filter((route) => !parentRoutes.includes(route.base));

  const allRoutes = [...intialBaseRoutes, ...orphanRoutes];

  const routesWithLayouts = allRoutes.map((route) => buildLayoutRoute(route));

  return routesWithLayouts;
}
