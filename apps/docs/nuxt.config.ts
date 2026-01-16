export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    defaultLocale: 'it',
    locales: [{
      code: 'it',
      name: 'Italiano',
    }, {
      code: 'en',
      name: 'English',
    }],
  },
});
