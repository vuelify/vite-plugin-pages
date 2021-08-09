import { parse } from '@vue/compiler-sfc';

function parseSFC(code: string) {
  try {
    return parse(code, {
      pad: 'space',
    }).descriptor;
  } catch {
    throw new Error('You must install "@vue/compiler-sfc" as a dev dependency to your project');
  }
}

export function getPageLayout(pageString: string) {
  const LayoutPropertyMatcher = new RegExp(/(?<=layout: ).*?(?<=")/);

  const layoutProp = parseSFC(pageString)
    .script?.content?.split('\n')
    ?.find((line) => line.match(LayoutPropertyMatcher));

  if (!layoutProp) return 'default';

  return layoutProp
    .replace('layout: ', '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/ /g, '')
    .replace(',', '')
    .toLowerCase();
}
