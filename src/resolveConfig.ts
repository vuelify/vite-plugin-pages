import { Options } from '.';
import { ResolvedConfig } from 'vite';

export interface ResolvedOptions extends Options {
  root: string;
  base: string;
  command: 'build' | 'serve';
}

export function resolveConfig(userOptions: Options, { root, base, command }: ResolvedConfig): any {
  const mergeOptions: ResolvedOptions = {
    layouts: true,
    prerender: true,
    pathToPages: './src/pages',
    pathToLayouts: './src/layouts',
    prerenderFolderName: 'prerender',
    ignore: [],
    root,
    base,
    command,
    ...userOptions,
  };

  return mergeOptions;
}
