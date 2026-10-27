import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ProjectService } from './project.service';

const HOME_TITLE = 'Irfan Parić | Software Developer & UI/UX Designer';
const HOME_DESCRIPTION = 'Irfan Parić is a software developer and UI/UX designer with a Computer Science degree from SSST, combining thoughtful design and full-stack development to build intuitive web experiences.';
const PERSON = {
  '@type': 'Person',
  name: 'Irfan Parić',
  jobTitle: ['Software Developer', 'UI/UX Designer'],
  sameAs: [
    'https://www.behance.net/irfanparich',
    'https://github.com/IrfanParic',
    'https://www.linkedin.com/in/irfan-paric-b96b6a160/',
  ],
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly projects = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);

  initialize(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.update());
    this.update();
  }

  private update(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const path = route.routeConfig?.path ?? '';
    const project = path === 'project-page/:projectId'
      ? this.projects.getProjects().find(project => project.id === route.paramMap.get('projectId'))
      : undefined;
    const isHome = path === '';
    const unavailable = path === 'page-unavailable';
    const title = project ? `${project.name} | Irfan Parić` : isHome ? HOME_TITLE
      : `${unavailable ? 'Page unavailable' : 'Page not found'} | Irfan Parić`;
    const description = project?.description ?? (isHome ? HOME_DESCRIPTION
      : unavailable ? 'This page is currently not available.' : 'Page not found.');

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: isHome || project ? 'index, follow' : 'noindex, follow' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Irfan Parić' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    let structuredData = this.document.getElementById('portfolio-structured-data');
    if (!isHome && !project) {
      structuredData?.remove();
      return;
    }
    if (!structuredData) {
      structuredData = this.document.createElement('script');
      structuredData.id = 'portfolio-structured-data';
      structuredData.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(project ? {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.name,
      description: project.description,
      creator: PERSON,
    } : { '@context': 'https://schema.org', ...PERSON });
  }
}
