import type { Plugin } from 'vite';

import { MODULE_IDS, MODULE_ID_VIRTUAL } from './constants';
import handleHMR from './hmr';
import { PluginAPI } from './plugin';
import { resolveConfig } from './resolveConfig';

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
   * This path is relative to your vite.config.ts OR the root option if set in vite.config.ts
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
   * This path is relative to your vite.config.ts OR the root option if set in vite.config.ts
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

export default function vuelifyPages(userOptions?: Options): Plugin {
  let plugin: PluginAPI;

  return {
    name: 'vuelify-pages',
    enforce: 'pre',
    async buildStart() {
      await plugin.initialize();
    },
    configResolved(config) {
      const options = resolveConfig(userOptions, config);
      plugin = new PluginAPI(options);
    },
    configureServer(server) {
      handleHMR(server, plugin);
    },
    resolveId(id: string) {
      return MODULE_IDS.includes(id) || MODULE_IDS.some((i) => id.startsWith(i))
        ? MODULE_ID_VIRTUAL
        : null;
    },
    load(id: string) {
      if (id !== MODULE_ID_VIRTUAL) return;

      return plugin.loadRoutes();
    },
  };
}
