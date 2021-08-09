import type { Plugin } from 'vite';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { MODULE_IDS, MODULE_ID_VIRTUAL } from './constants';
import { getPages } from './getPages';
import handleHMR from './hmr';

import { resolveConfig } from './resolveConfig';
import { sortRoutes } from './sortRoutes';
import { stringifyRoutes } from './stringfy';

export interface RouteObject {
  name: string;
  filePath: string;
  component: string;
  meta: { _render?: string; [key: string]: unknown };
  path: string;
  base: string;
  isChild: boolean;
  layout: string;
}

/**
 * Options For Vuelify Pages Plugin.
 */
export interface Options {
  /**
   * This path is relative to your vite.config.ts
   * @default "./src/pages"
   */
  pathToPages?: string;
  /**
   * The name of the folder thats within your pages directory that contains the files you want to prerender.
   * You can also prefix any file with $ if you don't want to use this folder
   * @default "prerender"
   */
  prerenderFolderName?: string;
  /**
   * Disable prerendering completely by setting this to false
   * @default true
   */
  prerender?: boolean;
  /**
   * Disable layouts by setting this to false
   * @default true
   */
  layouts?: boolean;
  /**
   * This path is relative to your vite.config.ts
   * @default "./src/layouts"
   */
  pathToLayouts?: string;
  /**
   * File names to ignore in fs mapping
   * @default []
   */
  ignore?: string[];
  /**
   * Alter the route object manually eg. add meta data
   * @default undefined
   */
  extend?: (route: RouteObject) => Partial<RouteObject> | void;
}

/**
 * This plugin doesn't need to be used
 * with @vuelify/prerender but it is designed to coincide with it.
 */

export default function vuelifyPages(options?: Options): Plugin {
  const { pathToPages, prerender, pathToLayouts, ignore, extend } = resolveConfig(options);

  let routes = null;
  let sortedRoutes = null;

  const addRoute = (newRoute: RouteObject) => routes.push(newRoute);

  const removeRoute = (path: string) => (routes = routes.filter((r) => r.filePath !== path));

  const invalidateRoutes = () => (sortedRoutes = null);

  const initalize = async function () {
    if (!existsSync(resolve('.vuelify'))) mkdirSync(resolve('.vuelify'));

    routes = await getPages(pathToPages, pathToLayouts, ignore, extend);

    sortedRoutes = sortRoutes(routes);

    if (!prerender) return;

    writeFileSync(resolve('.vuelify', 'routes.js'), `exports.default = ${JSON.stringify(routes)}`);
  };

  return {
    name: 'vuelify-pages',
    enforce: 'pre',
    buildStart() {
      return initalize();
    },
    configureServer(server) {
      handleHMR(server, invalidateRoutes, addRoute, removeRoute, {
        pathToLayouts,
        pathToPages,
        extend,
      });
    },
    resolveId(id: string) {
      return MODULE_IDS.includes(id) || MODULE_IDS.some((i) => id.startsWith(i))
        ? MODULE_ID_VIRTUAL
        : null;
    },
    async load(id: string) {
      if (id !== MODULE_ID_VIRTUAL) return;

      if (sortedRoutes === null) sortedRoutes = sortRoutes(routes);

      return `export const fsRoutes = ${stringifyRoutes(sortedRoutes)} `;
    },
  };
}
