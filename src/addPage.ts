import { readFileSync } from 'fs';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import { RouteObject } from '.';
import { getPageLayout } from './getPageLayout';

export function getRouteName(path: string) {
  if (!path) return '';

  const split = path.split('/');

  const name = split[split.length - 1].replace(':', '').replace('.vue', '');

  return name === '' ? 'Index' : upperFirst(camelCase(name));
}

export const getRouterPath = (filePath: string, pathToPages: string) =>
  filePath
    .replace(process.cwd(), '')
    .replace(pathToPages, '')
    .replace('.vue', '')
    .replace('/prerender', '')
    .replace('index', '/')
    .replace(/\/$/, '')
    .replace('$', '');

const isPrerendered = (filePath: string) => {
  const segements = filePath.split('/');

  return {
    _render:
      segements[segements.length - 1].startsWith('$') || filePath.includes('/prerender/')
        ? 'pre'
        : 'spa',
  };
};

export function checkParentRoute(routePath: string) {
  if (!routePath)
    return {
      path: '/',
      base: 'root',
      isChild: false,
    };
  const segments = routePath.split('/');
  let cleanPath = routePath;

  if (segments.length === 2)
    return {
      path: cleanPath,
      base: cleanPath.replace('/', '') || 'root',
      isChild: false,
    };

  // this checks if the end of the path matches
  // handles cases user names files like account/user/user.vue
  if (segments[segments.length - 1] === segments[segments.length - 2]) {
    segments.pop();

    cleanPath = segments.join('/');
  }

  return {
    path: cleanPath,
    base: segments[1],
    isChild: true,
  };
}

const getRelativePath = (filePath: string) => filePath.replace(process.cwd(), '.');

export function addPage(
  filePath: string,
  pathToPages: string,
  pathToLayouts: string,
  extend: (route: RouteObject) => Partial<RouteObject> | void,
) {
  const pagesPath = pathToPages.replace('.', '');
  const sfc = readFileSync(filePath, { encoding: 'utf-8' });
  const layout = getPageLayout(sfc);

  const routePath = getRouterPath(filePath, pagesPath);

  const systemRoute = {
    name: getRouteName(routePath),
    filePath,
    layout: `${pathToLayouts}/${layout}`.replace('.', ''),
    component: getRelativePath(filePath),
    meta: {
      ...isPrerendered(filePath),
    },
    ...checkParentRoute(routePath),
  };

  const extender = extend?.(systemRoute) || {};

  return {
    ...systemRoute,
    ...extender,
    meta: {
      ...systemRoute.meta,
      ...extender.meta,
    },
  };
}
