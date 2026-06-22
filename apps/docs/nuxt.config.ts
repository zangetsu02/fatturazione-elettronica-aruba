import { defineNuxtConfig } from 'nuxt/config';
import type { Nuxt, NuxtPage } from 'nuxt/schema';

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    (_options: Record<string, unknown>, nuxt: Nuxt) => {
      const i18n = (nuxt.options as { i18n?: { locales?: Array<string | { code: string }> } }).i18n;
      const codes = (i18n?.locales ?? []).map((l) => (typeof l === 'string' ? l : l.code));
      if (codes.length === 0) return;
      nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
        for (const page of pages) {
          if (page.name === 'lang-index' && page.path === '/:lang?') {
            page.path = `/:lang(${codes.join('|')})?`;
          }
        }
      });
    },
  ],
  i18n: {
    defaultLocale: 'it',
    locales: [
      {
        code: 'it',
        name: 'Italiano',
      },
      {
        code: 'en',
        name: 'English',
      },
    ],
  },
});
