import type { RouteRecord } from 'vue-router';
import { normalizePath } from 'vite';
import { resolve } from 'path';
import { ResolvedOptions } from './resolveConfig';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { getPages } from './getPages';
import { sortRoutes } from './sortRoutes';
import { stringifyRoutes } from './stringfy';
import { RouteObject } from '.';

export class PluginAPI {
  routes: null | RouteObject[];
  sortedRoutes: null | Partial<RouteRecord>[];
  options: ResolvedOptions;

  constructor(config: ResolvedOptions) {
    this.routes = null;
    this.sortedRoutes = null;
    this.options = {
      ...config,
      pathToPages: normalizePath(resolve(config.root, config.pathToPages)),
      pathToLayouts: normalizePath(resolve(config.root, config.pathToLayouts)),
    };
  }

  async initialize() {
    this.routes = await getPages(
      this.options.pathToPages,
      this.options.pathToLayouts,
      this.options.ignore,
      this.options.extend,
    );

    this.sortedRoutes = sortRoutes(this.routes);

    if (!this.options.prerender) return;

    if (!existsSync(resolve('.vuelify'))) mkdirSync(resolve('.vuelify'));
    writeFileSync(
      resolve('.vuelify', 'routes.js'),
      `exports.default = ${JSON.stringify(this.routes)}`,
    );
  }

  loadRoutes() {
    if (this.sortedRoutes === null) this.sortedRoutes = sortRoutes(this.routes);
    return `export const fsRoutes = ${stringifyRoutes(this.sortedRoutes)} `;
  }

  addRoute(newRoute: RouteObject) {
    this.routes.push(newRoute);
  }

  removeRoute(path: string) {
    this.routes = this.routes.filter((r) => r.filePath !== path);
  }

  invalidateRoutes() {
    this.sortedRoutes = null;
  }
}
