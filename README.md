# Leo Bogaert — Engineering Portfolio

Live site: https://leobogaert.com

I am a student from Ontario, Canada, currently studying at Western University.
This is a web-based portfolio of the major projects I have taken on over the past few years!

The site uses React and Vite.

Project content lives in `src/data/projects.ts`. Components are in `src/components`,
with audio, scroll tracking, image loading, and modal behavior in `src/hooks`.
Shared settings are in `src/config.ts`, and theme variables are at the top of
`src/styles.css`. Galleries load as their cards approach the viewport.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The included GitHub Actions workflow deploys the `dist` folder to GitHub Pages whenever `main` is updated.

Use Node 22.12+ for development and builds.

## Validation

```bash
npm test
npm run format:check
npm run test:browser
```

The unit tests check project assets, saved audio settings, and SVG optimization.
Browser tests cover desktop and mobile layouts, deferred images, carousel navigation,
nested dialogs, reduced motion, and audio controls. They start a local server automatically.
On Windows they use installed Microsoft Edge. On other platforms, run
`npx playwright install chromium` first. Set `PLAYWRIGHT_CHANNEL` to select another
installed Chromium-based browser.

Run `npm run format` to format source and configuration files. Public assets are excluded.
The SVG utility can be run with `node scripts/optimize-svg.mjs`.
