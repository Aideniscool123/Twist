import siteConfig from '@generated/docusaurus.config';
export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: {prism},
  } = siteConfig;
  const {additionalLanguages} = prism;
  const PrismBefore = globalThis.Prism;
  globalThis.Prism = PrismObject;
  additionalLanguages.forEach((lang) => {
    if (lang === 'php') {
      require('prismjs/components/prism-markup-templating.js');
    }
    require(`prismjs/components/prism-${lang}`);
  });
  delete globalThis.Prism;
  if (typeof PrismBefore !== 'undefined') {
    globalThis.Prism = PrismObject;
  }

  PrismObject.languages.twist = {
    comment: /;.*/,
    string: {pattern: /"(?:\\.|[^"\\])*"/, greedy: true},
    'class-name': /@[a-z_][a-z0-9_]*:/,
    constant: /@[a-z_][a-z0-9_]*/,
    variable: /#\d+/,
    important: /\b(?:rd2|cl2|sh1|sw1|rv1|ty1)\b/,
    keyword: /\b[a-z]{2}[1-9]\d*\b/,
    number: /-?\b\d+(?:\.\d+)?\b/,
  };
}
