import { Options } from '.';
import { ResolvedConfig } from 'vite';

export interface ResolvedOptions extends Options {
  root: string;
  base: string;
}

export function resolveConfig(userOptions: Options, { root, base }: ResolvedConfig): any {
  const mergeOptions: ResolvedOptions = {
    layouts: true,
    prerender: true,
    pathToPages: './src/pages',
    pathToLayouts: './src/layouts',
    prerenderFolderName: 'prerender',
    ignore: [],
    root,
    base,
    ...userOptions,
  };

  return mergeOptions;
}
