import siteConfig from '@generated/docusaurus.config';
export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: {prism},
  } = siteConfig;
  const {additionalLanguages} = prism;
  // Prism components work on the Prism instance on the window, while prism-
  // react-renderer uses its own Prism instance. We temporarily mount the
  // instance onto window, import components to enhance it, then remove it to
  // avoid polluting global namespace.
  // You can mutate PrismObject: registering plugins, deleting languages... As
  // long as you don't re-assign it
  const PrismBefore = globalThis.Prism;
  globalThis.Prism = PrismObject;
  additionalLanguages.forEach((lang) => {
    if (lang === 'php') {
      // eslint-disable-next-line global-require
      require('prismjs/components/prism-markup-templating.js');
    }
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`prismjs/components/prism-${lang}`);
  });
  // Clean up and eventually restore former globalThis.Prism object (if any)
  delete globalThis.Prism;
  if (typeof PrismBefore !== 'undefined') {
    globalThis.Prism = PrismObject;
  }

  // Twist, for ```twist code blocks. Order matters: earlier patterns win.
  PrismObject.languages.twist = {
    comment: /;.*/,
    string: {pattern: /"(?:\\.|[^"\\])*"/, greedy: true},
    'class-name': /@[a-z_][a-z0-9_]*:/, // label definitions, like @loop:
    constant: /@[a-z_][a-z0-9_]*/, // label references, like @loop
    variable: /#\d+/, // cells, like #0
    important: /\b(?:rd2|cl2|sh1|sw1|rv1|ty1)\b/, // the chaos instructions
    keyword: /\b[a-z]{2}[1-9]\d*\b/, // every other instruction code
    number: /-?\b\d+(?:\.\d+)?\b/,
  };
}
