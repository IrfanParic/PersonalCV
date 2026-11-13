import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import site from '../Data/site.json';
import { imageFor } from '../platform/images';
import { ProjectService } from './project.service';

const absoluteUrl = (path: string) => new URL(path, site.url).href;
const PERSON_ID = `${site.url}#person`;
const WEBSITE_ID = `${site.url}#website`;
const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: site.name,
  alternateName: site.alternateName,
  url: site.url,
  image: absoluteUrl(imageFor('assets/irfan-hero-duotone.png').src),
  jobTitle: ['Software Developer', 'Full-Stack Developer', 'UI/UX Designer'],
  knowsAbout: site.skills,
  sameAs: site.profiles,
};
const WEBSITE = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'Irfan Paric Portfolio',
  alternateName: 'Irfan Parić Portfolio',
  url: site.url,
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
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
    const indexable = isHome || !!project;
    const canonicalUrl = project ? absoluteUrl(`project-page/${encodeURIComponent(project.id)}/`) : site.url;
    const title = project ? `${project.name} | Irfan Paric Portfolio` : isHome ? site.title
      : `${unavailable ? 'Page unavailable' : 'Page not found'} | Irfan Paric`;
    const description = project ? this.shortDescription(`${project.name}: ${project.role} work by Irfan Parić. ${project.description}`)
      : isHome ? site.description : unavailable ? 'This page is currently not available.' : 'Page not found.';
    const image = absoluteUrl(site.socialImage);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Irfan Parić Portfolio' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:secure_url', content: image });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: 'Irfan Parić — software developer portfolio' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: 'Irfan Parić — software developer portfolio' });

    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (indexable) {
      if (!canonical) {
        canonical = this.document.createElement('link');
        canonical.rel = 'canonical';
        this.document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
      this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    } else {
      canonical?.remove();
      this.meta.removeTag('property="og:url"');
    }

    let structuredData = this.document.getElementById('portfolio-structured-data');
    if (!indexable) {
      structuredData?.remove();
      return;
    }
    if (!structuredData) {
      structuredData = this.document.createElement('script');
      structuredData.id = 'portfolio-structured-data';
      structuredData.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        PERSON,
        WEBSITE,
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: title,
          description,
          inLanguage: 'en',
          isPartOf: { '@id': WEBSITE_ID },
          about: { '@id': PERSON_ID },
          mainEntity: { '@id': project ? `${canonicalUrl}#project` : PERSON_ID },
        },
        ...(project ? [{
          '@type': 'CreativeWork',
          '@id': `${canonicalUrl}#project`,
          name: project.name,
          description: project.description,
          url: canonicalUrl,
          image: absoluteUrl(imageFor(`assets/${project.img}`).src),
          creator: { '@id': PERSON_ID },
        }] : []),
      ],
    }).replace(/</g, '\\u003c');
  }

  private shortDescription(value: string): string {
    if (value.length <= 160) return value;
    return `${value.slice(0, 157).replace(/\s+\S*$/, '')}…`;
  }
}
