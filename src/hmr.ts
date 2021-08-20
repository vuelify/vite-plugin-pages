import { resolve } from 'path';
import type { ModuleGraph, ViteDevServer, WebSocketServer } from 'vite';
import { RouteObject } from '.';
import { addPage } from './addPage';
import { MODULE_ID_VIRTUAL } from './constants';
import { PluginAPI } from './plugin';

function invalidateModule(moduleGraph: ModuleGraph) {
  const module = moduleGraph.getModuleById(MODULE_ID_VIRTUAL);
  if (module) {
    moduleGraph.invalidateModule(module);
    return module;
  }
  return null;
}

const reloadServer = (ws: WebSocketServer, moduleGraph: ModuleGraph) => {
  invalidateModule(moduleGraph);
  ws.send({
    type: 'full-reload',
  });
};

export default function handleHMR(server: ViteDevServer, plugin: PluginAPI) {
  const isRelevantChange = (path: string) =>
    path.startsWith(resolve(plugin.options.pathToPages)) ||
    path.startsWith(resolve(plugin.options.pathToLayouts));

  const { watcher, ws, moduleGraph } = server;

  watcher.on('add', (path) => {
    if (isRelevantChange(path)) {
      const { pathToPages, pathToLayouts, extend } = plugin.options;
      const newPage = addPage(path, pathToPages, pathToLayouts, extend);

      plugin.addRoute(newPage);
      plugin.invalidateRoutes();

      reloadServer(ws, moduleGraph);
    }
  });

  watcher.on('unlink', (path) => {
    if (isRelevantChange(path)) {
      plugin.removeRoute(path);
      plugin.invalidateRoutes();

      reloadServer(ws, moduleGraph);
    }
  });
}
