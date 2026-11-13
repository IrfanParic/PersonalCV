import { access, copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const site = JSON.parse(await readFile(new URL('../src/app/Data/site.json', import.meta.url), 'utf8'));
const { projects } = JSON.parse(await readFile(new URL('../src/app/Data/projects.json', import.meta.url), 'utf8'));
const output = resolve('dist/irfanparic');
const origin = new URL(site.url);
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('site.url must be the absolute HTTPS production root URL.');
}
const routes = ['', ...projects.map(project => `project-page/${encodeURIComponent(project.id)}/`)];
if (new Set(routes).size !== routes.length) throw new Error('Duplicate canonical project routes.');

for (const route of routes) {
  const html = await readFile(resolve(output, route, 'index.html'), 'utf8');
  const canonical = new URL(route, origin).href;
  if (!html.includes(`href="${canonical}"`)) throw new Error(`Missing prerendered canonical: ${canonical}`);
}
await access(resolve(output, site.socialImage));
await copyFile(resolve(output, '404/index.html'), resolve(output, '404.html'));

const escapeXml = value => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]);
// Experience start/end dates are not page modification dates. Do not invent lastmod.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${escapeXml(new URL(route, origin).href)}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve(output, 'sitemap.xml'), sitemap);
await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', origin).href}\n`);
console.log(`SEO output: ${routes.length} canonical pages, sitemap.xml, robots.txt, and 404.html.`);
