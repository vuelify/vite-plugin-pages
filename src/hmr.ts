import { resolve } from 'path';
import type { ModuleGraph, ViteDevServer, WebSocketServer } from 'vite';
import { RouteObject } from '.';
import { addPage } from './addPage';
import { MODULE_ID_VIRTUAL } from './constants';

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

export default function handleHMR(
  server: ViteDevServer,
  invalidateRoutes: () => void,
  addRoute: (route: RouteObject) => void,
  removeRoute: (path: string) => void,
  { pathToPages, pathToLayouts, extend },
) {
  const isRelevantChange = (path: string) => path.startsWith(resolve(pathToPages));

  const { watcher, ws, moduleGraph } = server;

  watcher.on('add', (path) => {
    if (isRelevantChange(path)) {
      const newPage = addPage(path, pathToPages, pathToLayouts, extend);
      addRoute(newPage);
      invalidateRoutes();
      reloadServer(ws, moduleGraph);
    }
  });

  watcher.on('unlink', (path) => {
    if (isRelevantChange(path)) {
      removeRoute(path);
      invalidateRoutes();
      reloadServer(ws, moduleGraph);
    }
  });
}
