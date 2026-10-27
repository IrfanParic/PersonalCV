import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationStart, Router, Scroll } from '@angular/router';
import { stickyHeaderHeight } from '../platform/visual-tools';

@Injectable({ providedIn: 'root' })
export class ProjectNavigationService {
  private homePosition?: [number, number];
  private homeNavigation?: { id: number; returnToProjects: boolean };
  private homeScroll?: Scroll;

  constructor(private readonly router: Router, private readonly location: Location) {
    const navigation = router.currentNavigation() ?? router.lastSuccessfulNavigation();
    if (navigation && router.serializeUrl(navigation.finalUrl ?? navigation.extractedUrl) === '/') {
      this.homeNavigation = { id: navigation.id, returnToProjects: navigation.extras.state?.['returnToProjects'] === true };
    }
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (router.url === '/') this.homePosition = [window.scrollX, window.scrollY];
        if (event.url === '/') {
          this.homeNavigation = {
            id: event.id,
            returnToProjects: router.currentNavigation()?.extras.state?.['returnToProjects'] === true
              || event.restoredState?.['returnToProjects'] === true,
          };
          this.homeScroll = undefined;
        }
      } else if (event instanceof Scroll && event.routerEvent.id === this.homeNavigation?.id) {
        this.homeScroll = event;
      }
    });
  }

  backToProjects(): void {
    if (history.state?.fromProjects && this.homePosition) {
      this.location.back();
    } else {
      void this.router.navigate(['/'], { state: { returnToProjects: true } });
    }
  }

  async restoreHome(ready: Promise<void>, signal: AbortSignal, refresh: () => void): Promise<void> {
    const navigation = this.homeNavigation;
    if (signal.aborted || !navigation) return;
    const scroll = this.homeScroll?.routerEvent.id === navigation.id ? Promise.resolve(this.homeScroll) : new Promise<Scroll | undefined>(resolve => {
      const subscription = this.router.events.subscribe(event => {
        if (event instanceof Scroll && event.routerEvent.id === navigation.id) {
          subscription.unsubscribe();
          signal.removeEventListener('abort', abort);
          resolve(event);
        }
      });
      const abort = () => {
        subscription.unsubscribe();
        resolve(undefined);
      };
      signal.addEventListener('abort', abort, { once: true });
    });
    const [event] = await Promise.all([scroll, ready, document.fonts.ready]);
    if (signal.aborted || !event || (!event.position && !navigation.returnToProjects)) return;
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    if (signal.aborted) return;
    refresh();
    const projects = document.getElementById('portfolio');
    const position = event.position ?? this.homePosition ?? [0, projects
      ? Math.max(0, window.scrollY + projects.getBoundingClientRect().top - stickyHeaderHeight()) : 0];
    window.scrollTo({ left: position[0], top: position[1], behavior: 'instant' });
  }
}
