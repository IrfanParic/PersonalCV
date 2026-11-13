import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { projects } from './Data/projects.json';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'project-page/:projectId',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return projects.map(project => ({ projectId: project.id }));
    },
  },
  { path: 'page-unavailable', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
