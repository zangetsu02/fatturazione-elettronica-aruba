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
    github: 'https://github.com/zangetsu02/fatturazione-aruba',
    npm: 'https://www.npmjs.com/org/fatturazione-aruba',
  },
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      links: [
        {
          icon: 'i-simple-icons-github',
          label: 'GitHub',
          to: 'https://github.com/zangetsu02/fatturazione-aruba',
          target: '_blank',
        },
      ],
    },
  },
  github: {
    url: 'https://github.com/zangetsu02/fatturazione-aruba',
    branch: 'main',
    rootDir: 'apps/docs/content',
  },
});
