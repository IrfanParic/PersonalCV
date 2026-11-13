import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Load old hash links as clean URLs before hydration, including hash changes
// made while the app is already open. Ordinary section anchors remain intact.
function redirectLegacyHash(): boolean {
  if (!location.hash.startsWith('#/')) return false;
  try {
    const legacyUrl = new URL(location.hash.slice(1), location.origin);
    if (legacyUrl.origin !== location.origin) return false;
    location.replace(legacyUrl.pathname + legacyUrl.search + legacyUrl.hash);
    return true;
  } catch {
    return false;
  }
}

if (!redirectLegacyHash()) {
  window.addEventListener('hashchange', redirectLegacyHash);
  platformBrowser().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}
