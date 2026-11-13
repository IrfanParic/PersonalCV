# Irfan Parić — developer portfolio

Angular portfolio with Tailwind, GSAP animations, project details, and an accessible image gallery. Production: https://irfanparic.netlify.app/.

## Local development

Use Node 24.15 or newer within Node 24 (`.nvmrc`), then:

```bash
npm ci
npm start
```

Open http://localhost:4200. For another port, use `npm start -- --port 4300`.

```bash
npm run build  # production Angular static prerender + sitemap/robots/404 generation
npm run watch  # development rebuilds
```

## Deployment and URLs

Netlify settings are checked in as `netlify.toml`: build with `npm run build`, publish `dist/irfanparic`. No runtime server is required. Deploy the complete output, including every prerendered directory, asset, `404.html`, `robots.txt`, and `sitemap.xml`.

The homepage and all project pages are prerendered using native Angular SSR tooling. Angular hydrates that HTML in the browser, then starts the existing loader, GSAP scroll scenes, and one-time shooting stars. With JavaScript disabled, portfolio content and project links remain readable.

Canonical URLs are `/` and `/project-page/1/` through `/project-page/6/`. Existing `/#/project-page/1` links remain supported: the browser replaces them with the corresponding clean URL before hydration. Unknown routes and invalid project IDs use the existing not-found view; Netlify serves them with HTTP 404 instead of a successful SPA fallback. Unavailable/error pages are `noindex` and omitted from the sitemap.

## SEO configuration and Search Console

`src/app/Data/site.json` is the source for the production origin, name variants, skills, social profiles, and share image. `SeoService` updates unique page titles/descriptions, canonicals, Open Graph/Twitter cards, and JSON-LD for direct requests and client navigation. Person and WebSite entities use stable IDs; project pages also describe their CreativeWork.

`npm run build` generates the sitemap from the project data and verifies each canonical prerender exists. Experience dates are not page-edit dates, so the sitemap deliberately omits `lastmod` rather than fabricating dates. If the production hostname changes, update `site.json`, the source metadata in `src/index.html`, and `src/robots.txt`, then rebuild. The generated sitemap/robots use the configured origin.

After deploying:

1. Open https://search.google.com/search-console and select or verify the `https://irfanparic.netlify.app/` URL-prefix property. The existing Google verification meta tag is preserved; no credentials are added.
2. In **Sitemaps**, submit `https://irfanparic.netlify.app/sitemap.xml`.
3. Use **URL inspection** for the homepage and project pages, run **Test live URL**, and request indexing where appropriate.
4. Monitor indexing and Core Web Vitals. Sitemap submission helps discovery; Google controls indexing and rankings.

The branded social preview is `src/assets/social-preview.jpg` (1200×630), composed from the existing portrait and logo.

## Content, assets, and appearance

Project content lives in `src/app/Data/projects.json`; the CV and original images remain in `src/assets`. Preserve truthful content and existing profile links. New projects automatically enter prerendering and the sitemap after rebuilding.

Responsive WebP variants live in `src/assets/optimized`, with paths/dimensions in `src/app/Data/image-metadata.json` and the `imageFor` helper. The originals remain available. New source images can use the original-asset fallback until matching variants/metadata are generated. Keep variants visually faithful and preserve portrait transparency; use 480/960/1600px widths capped to the original, and quality around 0.92. Thumbnails load lazily, hero/project previews are prioritized, and full gallery content loads when opened.

Shared palette/typography live in `src/styles.css`. Google Fonts are requested directly from the document head with preconnect and `display=swap`. `src/icons.css` includes only the 11 Bootstrap Icons used by the templates, retaining the installed icon font; when adding an icon, copy its matching rule from the installed Bootstrap Icons stylesheet.

GSAP is dynamically imported, initializes only in the browser after rendering, respects reduced motion, and cleans up on destruction. Three.js remains unused and lazy. Preserve these constraints when extending animations. Gallery dialogs support Escape, arrow keys, touch swipes, and focus restoration.

## Verification

No new tests are added. Validate with a production build, direct requests with JavaScript disabled, and browser checks at mobile/tablet/desktop widths. Check unique metadata, canonical URLs, structured-data JSON, sitemap entries, existing hash links, direct project reloads, 404 status, gallery controls, CV/social links, loader/shooting-star timing, scroll restoration, and reduced-motion behavior.

Production SEO changes become publicly accessible only after the updated build is deployed to Netlify. Existing external sites may block automated link checks; do not replace their links with guessed destinations.
