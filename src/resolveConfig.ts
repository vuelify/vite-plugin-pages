import { Options } from '.';

export function resolveConfig(userOptions: Options) {
  const mergeOptions: Options = {
    layouts: true,
    prerender: true,
    pathToPages: './src/pages',
    pathToLayouts: './src/layouts',
    prerenderFolderName: 'prerender',
    ignore: [],
    ...userOptions,
  };

  return mergeOptions;
}
