export function stringifyRoutes(routes: any) {
  const string = JSON.stringify(routes, null, 2)
    .split('\n')
    .map((line) => {
      if (line.includes('"component": '))
        return `    component: () => import("/${line
          .split(' "')[2]
          .replace(/.*\/src/, 'src')
          .replace(',', '')}),`;

      return line;
    })
    .join('\n');

  return string;
}
