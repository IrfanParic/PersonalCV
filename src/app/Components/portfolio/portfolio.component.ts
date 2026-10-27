import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
import type { gsap } from 'gsap';
import { Project } from '../../Models/project';
import { ProjectService } from '../../Services/project.service';
import { loadGsap } from '../../platform/visual-tools';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class PortfolioComponent implements AfterViewInit, OnDestroy {
  readonly projects: Project[];
  readonly currentProjects: Project[];
  private animationMedia?: gsap.MatchMedia;
  private destroyed = false;
  private readonly revealed = new WeakSet<HTMLElement>();

  constructor(projectService: ProjectService, private readonly element: ElementRef<HTMLElement>, private readonly zone: NgZone) {
    this.projects = projectService.getProjects();
    this.currentProjects = this.projects.filter(project => project.active);
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => void this.initializeReveals());
  }

  private async initializeReveals(): Promise<void> {
    try {
      const [gsap, { ScrollTrigger }] = await Promise.all([loadGsap(), import('gsap/ScrollTrigger')]);
      if (this.destroyed) return;
      gsap.registerPlugin(ScrollTrigger);
      const cards = Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>('.project-card'));
      this.animationMedia = gsap.matchMedia(this.element.nativeElement);
      this.animationMedia.add({
        motion: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)'
      }, context => {
        if (context.conditions?.['reduced']) {
          cards.forEach(card => this.revealed.add(card));
          return;
        }
        for (const card of cards) {
          if (this.revealed.has(card)) continue;
          gsap.fromTo(card, { autoAlpha: 0, y: 24 }, {
            autoAlpha: 1, y: 0, duration: 2, ease: 'sine.inOut',
            onStart: () => { this.revealed.add(card); },
            onComplete: () => { gsap.set(card, { clearProps: 'opacity,visibility,transform' }); },
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              once: true,
              // Measure these after the upstream hero pin during every refresh.
              refreshPriority: -1
            }
          });
        }
        const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => cancelAnimationFrame(refreshFrame);
      });
    } catch {
      this.animationMedia?.revert();
      // Project content remains visible if optional animation cannot load.
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.animationMedia?.revert();
  }
}
