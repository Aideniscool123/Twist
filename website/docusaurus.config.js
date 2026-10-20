import {themes as prismThemes} from 'prism-react-renderer';

const config = {
  title: 'Twist',
  tagline: 'A single digit changes the whole meaning.',
  favicon: 'img/logo.svg',

  url: 'https://aideniscool123.github.io',
  baseUrl: '/Twist/',
  organizationName: 'Aideniscool123',
  projectName: 'Twist',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;600;700&display=swap',
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      { hashed: true, indexBlog: true, highlightSearchTermsOnTargetPage: true },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/Aideniscool123/Twist/tree/main/website/',
        },
        blog: {
          blogTitle: 'Twist dev log',
          blogDescription: 'How Twist was built, phase by phase',
          blogSidebarTitle: 'All dev log posts',
          blogSidebarCount: 'ALL',
          showReadingTime: true,
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: { customCss: './src/css/custom.css' },
      },
    ],
  ],

  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'powershell', 'json'],
    },
    navbar: {
      title: 'Twist',
      logo: { alt: 'Twist', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'learn', label: 'Learn', position: 'left' },
        { type: 'docSidebar', sidebarId: 'reference', label: 'Reference', position: 'left' },
        { type: 'docSidebar', sidebarId: 'examples', label: 'Examples', position: 'left' },
        { href: 'pathname:///play/playground/', label: 'Playground', position: 'left' },
        { to: '/blog', label: 'Dev log', position: 'left' },
        { href: 'https://github.com/Aideniscool123/Twist', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            { label: 'Getting started', to: '/docs/getting-started/installation' },
            { label: 'Tutorial', to: '/docs/tutorial/hello' },
            { label: 'Language guide', to: '/docs/language/lines' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'Instructions', to: '/docs/reference/instructions' },
            { label: 'Command line', to: '/docs/reference/cli/overview' },
            { label: 'Error messages', to: '/docs/reference/errors' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Playground', href: 'pathname:///play/playground/' },
            { label: 'Examples', to: '/docs/examples' },
            { label: 'Dev log', to: '/blog' },
            { label: 'GitHub', href: 'https://github.com/Aideniscool123/Twist' },
          ],
        },
      ],
      copyright: `Twist, ${new Date().getFullYear()}. ps1 and ps2 are not related.`,
    },
  },
};

export default config;
