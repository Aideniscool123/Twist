# Twist docs site

The Twist website, built with [Docusaurus](https://docusaurus.io). It's
published to https://aideniscool123.github.io/Twist/ by
`.github/workflows/deploy-docs.yml` whenever `main` changes.

## Working on it

```
npm install
npm start        # live preview at http://localhost:3000/Twist/
npm run build    # the real build; fails on broken links
npm run serve    # preview the real build
```

## Where things are

| Path | What |
| --- | --- |
| `docs/` | Hand-written pages: intro, getting started, tutorial, language guide, reference, internals, project |
| `blog/` | The dev log |
| `src/pages/index.js` | The homepage |
| `src/css/custom.css` | Colors and fonts |
| `src/theme/prism-include-languages.js` | Twist syntax highlighting |
| `scripts/generate.mjs` | Builds the instruction, category and example pages from Twist's source |
| `scripts/copy-playground.mjs` | Copies the playground into `static/play/` |

The generated folders (`docs/reference/instructions/`,
`docs/reference/categories/`, `docs/examples/` and `static/play/`) are rebuilt
before every `start` and `build`, and aren't committed.

Every ```` ```twist ```` block in `docs/` is checked by `test/site.test.js` in
the main project, and so is the ```` ```text ```` output after it.
