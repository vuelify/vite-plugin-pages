# Vuelify Pages

Vite plugin for Vue that maps your page routes to the file system with easy over ride feature and layout configuration.

I'm still working on a starter Vuelify template and it's not available publicly at the moment, but you can check out the [live demo here](https://vuelify.netlify.app/)

```
npm i @vuelify/vite-plugin-pages --save-dev
```

## Initial Setup

```javascript
// ./vite.config.ts

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Pages from '@vuelify/vite-plugin-pages';

export default defineConfig({
  plugins: [vue(), Pages()],
});
```

```javascript
// ./src/routes.ts

import { fsRoutes } from "virtual:vuelify-pages";
import {
  RouteRecordRaw,
  createRouter,
  createWebHistory,
} from "vue-router";


const routes: RouteRecordRaw[] = [];

const allRoutes = [...routes, ...fsRoutes];

const routes = createRouter({
    history: createWebHistory(),
    routes: allRoutes,
  });
}

export { routes }
```

```javascript
// ./src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import { routes } from './routes';

createApp(App).use(routes).mount('#app');
```

## Layout Setup

Inspired by Nuxt, just add the property to your page component

```vue
<!-- ./src/pages/index.vue -->
<template>
  <div>
    <h1>My Home Page</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  // at run time the layouts will be added and the page will become a
  // a child route of the layout component.
  // If you don't specify this, default.vue will be used
  // If default.vue didn't exist in layout dir, Vue would throw an error
  layout: 'default',
  setup() {
    return {};
  },
});
</script>
```

```vue
<!-- ./src/layouts/default.vue -->

<template>
  <NavBar />
  <!-- the router view needs to exist so vue knows where to render the child components -->
  <router-view></router-view>
</template>
```

### Extending Routes

The plugin accepts an `extend` option that is a function that receives the RouteObject as an argument. This can be used to alter any of the values in the route object by returning the desired values from this function.

Altering anything outside of the `layout` or `meta` values isn't a good idea unless you know what you're doing.

```javascript
{
  extend: (route) => {
    const unauthenticated = ['Index', 'SignIn', 'SignUp'];

    if (unauthenticated.includes(route.name)) return {};

    return {
      meta: {
        auth: true,
      },
    };
  };
}
```

### Ignoring Files

You can ignore specific files by placing them in the ignore array. If you have to files of the same name, but only want one to be ignored you can include the parent folder.

```javascript
{
  ignore: [':userSlug.vue', ':userSlug/settings.vue'];
}
```

### Prerendering

This package can be used in conjuction with @vuelify/vite-plugin-prerender to pick and choose what routes you prerender.

**COMING SOON**

### Options

`pathToPages` - the folder path for pages relative to your vite.config.ts file (default `./src/pages`)

`prerenderFolderName` - the name of the folder containing your prerendered pages (default `prerender`)

`prerender` - when set to false turns off prerendering completely (default `true`)

`layouts` - disable layouts by setting this to false (default `true`)

`pathToLayouts` - This path is relative to your vite.config.ts (default `./src/layouts`)

`ignore` - An array of file names to ignore in the FS system mapping (default `[]`)

`extend` - Alter the route object manually eg. add meta data (default `undefined`)

### Types

Add to `vite-env.d.ts` to get typings in your route file when using `import { fsRoutes } from "virtual:vuelify-pages";`

```javascript
/// <reference types="@vuelify/vite-plugin-pages/client" />
```

### To Do

- HMR (At the moment you must manually restart the server when you change a pages layout. add/remove pages will automatically restart server)
- Prerendering (At the moment this package will recognise what you want to prerender but @vuelify/cli & @vue/vite-plugin-prerender arn't completed, to have a play around with this feauture see [here](#prerendering) )
- Tests (More unit tests)
- Catch All Route (At the moment you must configure a catch all route yourself)

### Maintenance & Bugs

All @vuelify packages follow semantic versioning. There will be no breaking changes to the options the plugin accepts without major version upgrade. All the changes will happen under the hood.

I will be actively maintaining this package. If you'd like to help out with that, submit a pull request. If you find a bug, open an issue and I'll get to it ASAP.

This package only works with Vue & I have no intention of adding another framework any time soon.

It was designed to work best within the world of @vuelify and with typescript.
