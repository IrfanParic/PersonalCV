import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import type { gsap } from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loadGsap, scrollToSection, stickyHeaderHeight } from '../../platform/visual-tools';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class WelcomeComponent implements AfterViewInit, OnDestroy {
  headerScrolled = false;
  activeSection = 'home';
  readonly quoteLines = ['Small steps today.', 'Extraordinary things tomorrow.'].map(line => line.split(' '));
  @ViewChild('heroScene', { static: true }) private heroScene!: ElementRef<HTMLElement>;
  @ViewChild('quote', { static: true }) private quote!: ElementRef<HTMLElement>;
  private readonly scrollLifetime = new AbortController();
  private resizeObserver?: ResizeObserver;
  private animationReady?: Promise<void>;
  private animationMedia?: gsap.MatchMedia;
  private quoteTrigger?: ScrollTrigger;

  ngAfterViewInit(): void {
    this.animationReady = this.initializeQuoteAnimation();
    this.resizeObserver = new ResizeObserver(() => this.updateActiveSection());
    for (const id of ['header', 'main']) {
      const element = document.getElementById(id);
      if (element) this.resizeObserver.observe(element);
    }
  }

  private async initializeQuoteAnimation(): Promise<void> {
    try {
      const [gsap, { ScrollTrigger }] = await Promise.all([loadGsap(), import('gsap/ScrollTrigger')]);
      if (this.scrollLifetime.signal.aborted) return;
      gsap.registerPlugin(ScrollTrigger);
      const scene = this.heroScene.nativeElement;
      this.animationMedia = gsap.matchMedia(scene);
      this.animationMedia.add('(prefers-reduced-motion: no-preference)', () => {
        scene.classList.add('hero-scene-animated');
        const words = scene.querySelectorAll('.quote-word');
        gsap.set(this.quote.nativeElement, { autoAlpha: 0 });
        gsap.set(words, { opacity: 0.25 });
        gsap.set('.quote-mark', { opacity: 0 });
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: scene,
            pin: true,
            start: () => `top top+=${stickyHeaderHeight()}`,
            end: () => `+=${window.innerHeight * 1.5}`,
            scrub: true,
            invalidateOnRefresh: true
          }
        });
        timeline
          .to('.hero-copy, .hero-portrait, .hero-scroll', { autoAlpha: 0, y: '-=80', duration: 0.25 }, 0)
          .to(this.quote.nativeElement, { autoAlpha: 1, duration: 0.12 }, 0.3)
          .to(words, { opacity: 1, duration: 0.06, stagger: { amount: 0.27 } }, 0.42)
          .to('.quote-mark', { opacity: 1, duration: 0.1 }, 0.75)
          .to({}, { duration: 0.15 }, 0.85);
        this.quoteTrigger = timeline.scrollTrigger;
        this.updateActiveSection();
        return () => {
          this.quoteTrigger = undefined;
          scene.classList.remove('hero-scene-animated');
        };
      });
    } catch {
      this.animationMedia?.revert();
      // Keep both sections readable in normal flow if animation cannot load.
    }
  }

  async explore(): Promise<void> {
    await this.animationReady;
    if (this.scrollLifetime.signal.aborted) return;
    const trigger = this.quoteTrigger;
    const target = trigger ? trigger.start + (trigger.end - trigger.start) * 0.48 : this.quote.nativeElement;
    await scrollToSection(target, this.scrollLifetime.signal);
  }

  scroll(section: HTMLElement): void {
    void scrollToSection(section, this.scrollLifetime.signal);
  }

  scrolltop(): void {
    void scrollToSection(0, this.scrollLifetime.signal);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateActiveSection(): void {
    this.headerScrolled = window.scrollY > 8;
    const threshold = stickyHeaderHeight() + 2;
    let active = 'home';
    for (const id of ['about', 'portfolio', 'contact']) {
      if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= threshold) active = id;
    }
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = 'contact';
    }
    this.activeSection = active;
  }

  ngOnDestroy(): void {
    this.scrollLifetime.abort();
    this.animationMedia?.revert();
    this.resizeObserver?.disconnect();
  }
}
