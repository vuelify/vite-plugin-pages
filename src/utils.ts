import { camelCase, upperFirst } from 'lodash';
import { resolve } from 'path';

function slash(path: string) {
  return path.replace(/\\/g, '/');
}

export function normalizedResolve(...paths: string[]) {
  return slash(resolve(...paths));
}

const getRelativePath = (filePath: string) => filePath.replace(process.cwd(), '.');

export const ClassCase = (string: string) => upperFirst(camelCase(string));
