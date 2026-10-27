# Irfan Parić — personal portfolio

Angular portfolio with Tailwind styling, project details, and an accessible image gallery. Project content lives in `src/app/Data/projects.json`; images and the CV live in `src/assets`.

## Start locally

Install [nvm](https://github.com/nvm-sh/nvm) if you use it to manage Node versions, then run from this directory:

```bash
nvm install
nvm use
npm ci
npm start
```

Use Node **24.15 or newer within Node 24** (the version family in `.nvmrc`). If you manage Node another way, select that version before running npm. No global Angular CLI installation is needed.

Open **http://localhost:4200**. Keep the terminal running; saving source files updates the browser. Stop the server with Ctrl+C. For another port, use `npm start -- --port 4300`.

```bash
npm run build                          # optimized production build
npm run build -- --configuration development
npm run watch                          # rebuild development output on changes

git diff --stat                        # overview of local changes
git diff                               # inspect the changes
```

The production output directory is configured in `angular.json`. Preserve hash-based URLs such as `/#/project-page/1` when hosting the app. `npm start` is a local development server, not a production hosting command.

## Styling and content

Use Tailwind utilities in component templates. Shared palette and typography tokens live in `src/styles.css`: canvas, surface, ink, muted, accent, body, and heading. Project role colors come from the project JSON and use Angular style bindings. Bootstrap Icons supplies icons only; Bootstrap layout/CSS/JavaScript is not used.

The site is intentionally static: no entrance effects, hover movement, smooth scrolling, or route transitions. About information is always visible. Gallery thumbnails open a native modal dialog; Escape closes it, arrow keys change images, and focus returns to the thumbnail.

## Adding animation and 3D later

GSAP and Three.js are installed. `src/app/platform/visual-tools.ts` exports `loadGsap()` and `loadThree()` using dynamic imports. Call these only from the component that needs them; ordinary visits should not download either library. The hero's `data-scene-host` element is the integration point for a future scene, currently showing static artwork.

For a future GSAP feature:

- Initialize after the component view exists and scope selectors with `gsap.context(callback, hostElement)`.
- Register context cleanup with Angular `DestroyRef`; call `context.revert()` on destruction. Clean up plugins and listeners created outside the context too.
- Respect `prefers-reduced-motion: reduce` using `gsap.matchMedia()`, retain a readable static state, and revert media contexts during cleanup.
- If a dynamic import resolves after the component is destroyed, do not create an animation or access its view.

For a future Three.js feature:

- Dynamically load the renderer only when the scene is needed. Keep the existing artwork as the fallback if WebGL is unavailable or initialization fails.
- Keep the canvas inside the hero host and observe its dimensions with `ResizeObserver`; update the renderer size and camera aspect when they change. Bound device pixel ratio for performance.
- Keep render loops outside Angular change detection when using Zone.js. Pause when the scene is hidden; do not start a loop for an unused scene.
- On destruction, cancel animation frames or clear the animation loop, disconnect observers, remove listeners/canvas, and dispose controls, geometries, materials, textures, and the renderer.
- Reduced-motion users should receive the static fallback or a single nonmoving render. No continuous rendering or active GSAP effects are enabled by this foundation.

## Verification

No new tests are added. Validate dependency installation and development/production builds, then check the home sections, project links and galleries, invalid project URLs, unavailable/not-found views, contact links, CV download, keyboard navigation, and layouts at 320px, 768px, and desktop widths.

Validated with a clean `npm ci`, production/development builds, and browser checks at 320px, 768px, and 1440px. All six project URLs, gallery controls and focus restoration, fallback pages, CV download, and contact links were checked. GSAP and Three.js are absent from normal page requests.

Dependency audit at this update: production dependencies report zero vulnerabilities. The full audit reports six high-severity entries from the retained Karma development tooling's transitive `braces` dependency; no compatible patched release is available. Existing test sources are unchanged.
