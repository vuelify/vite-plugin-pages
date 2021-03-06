import { should } from 'chai';
import { resolve } from 'path';
import { getPages } from '../src/getPages';

should();

function checkRouterObject(
  routerObject: any,
  { nameValue, componentValue, renderValue, pathValue, baseValue, isChildValue }: any,
) {
  const { name, component, meta, path, base, isChild } = routerObject;
  const { _render } = meta;

  name.should.equal(nameValue);
  component.should.equal(componentValue);
  _render.should.equal(renderValue);
  path.should.equal(pathValue);
  base.should.equal(baseValue);
  isChild.should.equal(isChildValue);
}

describe('getPages(pathToPages: string)', function () {
  it('correctly parses prerended $index file path into a router object', async function () {
    const pages = await getPages(
      resolve(process.cwd(), './test/pages'),
      './test/layouts',
      [],
      undefined,
      undefined,
    );
    const [index, spa] = pages;

    checkRouterObject(index, {
      nameValue: 'Index',
      componentValue: './test/pages/$index.vue',
      renderValue: 'pre',
      pathValue: '/',
      baseValue: 'root',
      isChildValue: false,
    });
  });

  it('correctly parses spa file path into a router object', async function () {
    const pages = await getPages(
      resolve(process.cwd(), './test/pages'),
      './test/layouts',
      [],
      undefined,
      undefined,
    );
    const [index, spa] = pages;

    checkRouterObject(spa, {
      nameValue: 'Spa',
      componentValue: './test/pages/spa.vue',
      renderValue: 'spa',
      pathValue: '/spa',
      baseValue: 'spa',
      isChildValue: false,
    });
  });
});
