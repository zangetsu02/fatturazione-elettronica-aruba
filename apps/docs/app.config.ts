export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      secondary: 'sky',
    },
  },
  seo: {
    title: 'Fatturazione Elettronica Aruba SDK',
    description: 'TypeScript SDK for Aruba Electronic Invoicing API v2',
  },
  header: {
    title: 'Fatturazione Elettronica Aruba',
    logo: {
      // light: '/logo-light.svg',
      // dark: '/logo-dark.svg',
      alt: 'Fatturazione Elettronica Aruba SDK',
    },
  },
  socials: {
    npm: 'https://www.npmjs.com/org/fatturazione-elettronica-aruba',
  },
  toc: {
    title: 'On this page',
  },
  github: {
    url: 'https://github.com/zangetsu02/fatturazione-elettronica-aruba',
    branch: 'main',
    rootDir: 'apps/docs/content',
  },
});
