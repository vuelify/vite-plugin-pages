import FastGlob from 'fast-glob';
import { RouteObject } from '.';
import { addPage } from './addPage';

import { normalizedResolve } from './utils';

export async function getPages(
  pathToPages: string,
  pathToLayouts: string,
  ignore: string[],
  extend: (route: RouteObject) => Partial<RouteObject> | void,
  base: string,
) {
  const pages = await FastGlob(`${normalizedResolve(process.cwd(), pathToPages)}/**/*.vue`);

  const filterIgnored = (path) =>
    ignore.filter((fileName) => path.endsWith(fileName)).length > 0 ? false : true;

  if (pages.length === 0) return [];

  const routes: RouteObject[] = pages
    .filter((path) => filterIgnored(path))
    .map((filePath: string) => addPage(filePath, pathToPages, pathToLayouts, extend, base));

  return routes;
}
