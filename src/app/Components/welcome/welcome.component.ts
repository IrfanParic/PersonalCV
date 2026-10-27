import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild } from '@angular/core';
import type { gsap } from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loadGsap, scrollToSection, stickyHeaderHeight } from '../../platform/visual-tools';
import { AboutComponent } from '../about/about.component';
import { ProjectNavigationService } from '../../Services/project-navigation.service';

let homeLoaderShown = false;
function claimHomeLoader(): boolean {
  if (homeLoaderShown) return false;
  homeLoaderShown = true;
  return true;
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class WelcomeComponent implements AfterViewInit, OnDestroy {
  loading = claimHomeLoader();
  loaderLeaving = false;
  private readonly loaderInput = new AbortController();
  private readonly loaderTimers = new Set<ReturnType<typeof setTimeout>>();
  private loaderFrame = 0;
  headerScrolled = false;
  logoVisible = window.matchMedia('(max-width: 1023px)').matches;
  activeSection = 'home';
  readonly quoteLines = ['Small steps today.', 'Extraordinary things tomorrow.'].map(line => line.split(' '));
  @ViewChild('heroScene', { static: true }) private heroScene!: ElementRef<HTMLElement>;
  @ViewChild('quote', { static: true }) private quote!: ElementRef<HTMLElement>;
  @ViewChild(AboutComponent) private aboutComponent!: AboutComponent;
  private readonly scrollLifetime = new AbortController();
  private resizeObserver?: ResizeObserver;
  private animationReady?: Promise<void>;
  private animationMedia?: gsap.MatchMedia;
  private quoteTrigger?: ScrollTrigger;
  private sceneTimeline?: gsap.core.Timeline;

  constructor(private readonly projectNavigation: ProjectNavigationService, private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.animationReady = this.initializeQuoteAnimation();
    const homeRestored = this.projectNavigation.restoreHome(this.animationReady, this.scrollLifetime.signal, () => {
      this.quoteTrigger?.refresh();
    }).then(() => {
      if (!this.scrollLifetime.signal.aborted) this.updateActiveSection();
    });
    if (this.loading) void this.prepareLoader(homeRestored);
    this.resizeObserver = new ResizeObserver(() => {
      this.updateActiveSection();
    });
    for (const id of ['header', 'main']) {
      const element = document.getElementById(id);
      if (element) this.resizeObserver.observe(element);
    }
  }

  private loaderDelay(milliseconds: number): Promise<void> {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        this.loaderTimers.delete(timer);
        resolve();
      }, milliseconds);
      this.loaderTimers.add(timer);
    });
  }

  private async prepareLoader(homeRestored: Promise<void>): Promise<void> {
    const signal = this.scrollLifetime.signal;
    const preventScroll = (event: Event) => event.preventDefault();
    const options = { passive: false, signal: this.loaderInput.signal };
    window.addEventListener('wheel', preventScroll, options);
    window.addEventListener('touchmove', preventScroll, options);
    window.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) event.preventDefault();
    }, { signal: this.loaderInput.signal });
    const portrait = this.heroScene.nativeElement.querySelector<HTMLImageElement>('.hero-portrait img');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ready = Promise.allSettled([
      this.animationReady,
      document.fonts.ready,
      portrait?.decode(),
      homeRestored,
    ]);
    const aborted = new Promise<void>(resolve => signal.addEventListener('abort', () => resolve(), { once: true }));
    await Promise.race([
      Promise.all([Promise.race([ready, this.loaderDelay(5000)]), this.loaderDelay(reducedMotion.matches ? 0 : 700)]),
      aborted,
    ]);
    if (signal.aborted) return;
    await Promise.race([new Promise<void>(resolve => {
      this.loaderFrame = requestAnimationFrame(() => {
        this.loaderFrame = 0;
        resolve();
      });
    }), aborted]);
    if (signal.aborted) return;
    this.quoteTrigger?.refresh();
    if (reducedMotion.matches) {
      this.finishLoader();
      return;
    }
    this.loaderLeaving = true;
    void this.loaderDelay(850).then(() => {
      if (!signal.aborted) this.finishLoader();
    });
  }

  loaderTransitionEnd(event: TransitionEvent): void {
    if (event.target === event.currentTarget && event.propertyName === 'transform') this.finishLoader();
  }

  private finishLoader(): void {
    this.loading = false;
    this.loaderInput.abort();
    for (const timer of this.loaderTimers) clearTimeout(timer);
    this.loaderTimers.clear();
  }

  private async initializeQuoteAnimation(): Promise<void> {
    try {
      const [gsap, { ScrollTrigger }] = await Promise.all([loadGsap(), import('gsap/ScrollTrigger')]);
      if (this.scrollLifetime.signal.aborted) return;
      gsap.registerPlugin(ScrollTrigger);
      const scene = this.heroScene.nativeElement;
      this.animationMedia = gsap.matchMedia(scene);
      this.zone.runOutsideAngular(() => this.animationMedia!.add(
        '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          const hero = scene.querySelector<HTMLElement>('.hero');
          const particles = scene.querySelector<HTMLElement>('.hero-particles');
          if (!hero || !particles) return;
          const lifetime = new AbortController();
          const moveX = gsap.quickTo(particles, 'x', { duration: 0.7, ease: 'power3.out' });
          const moveY = gsap.quickTo(particles, 'y', { duration: 0.7, ease: 'power3.out' });
          hero.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse' || hero.inert) return;
            const bounds = hero.getBoundingClientRect();
            const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
            const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
            moveX(x * 20);
            moveY(y * 14);
          }, { passive: true, signal: lifetime.signal });
          hero.addEventListener('pointerleave', () => {
            moveX(0);
            moveY(0);
          }, { signal: lifetime.signal });
          return () => lifetime.abort();
        },
      ));
      this.animationMedia.add({
        mobile: '(width < 640px) and (prefers-reduced-motion: no-preference)',
        desktop: '(width >= 640px) and (prefers-reduced-motion: no-preference)'
      }, context => {
        const mobile = Boolean(context.conditions?.['mobile']);
        scene.classList.add('hero-scene-animated', 'about-scene-animated');
        const about = scene.querySelector<HTMLElement>('#about')!;
        const stage = about.querySelector<HTMLElement>('.about-stage')!;
        const composition = about.querySelector<HTMLElement>('.about-composition')!;
        const card = about.querySelector<HTMLElement>('.about-card')!;
        const download = about.querySelector<HTMLElement>('.about-download')!;
        const hero = scene.querySelector<HTMLElement>('.hero')!;
        const words = scene.querySelectorAll('.quote-word');
        let settledY = 0;
        let overflow = 0;
        let scrollUnit = window.innerHeight * 1.5;
        const measure = () => {
          // offset measurements ignore the current scroll and pointer transforms.
          settledY = Math.max(0, 8 - composition.offsetTop);
          overflow = Math.max(0, composition.offsetTop + settledY + composition.offsetHeight - stage.clientHeight + 8);
          scrollUnit = window.innerHeight * 1.5;
        };
        measure();
        gsap.set(this.quote.nativeElement, { autoAlpha: 0 });
        gsap.set(words, { opacity: 0.25 });
        gsap.set('.quote-mark', { opacity: 0 });
        gsap.set(about, { autoAlpha: 0 });
        gsap.set('.about-glow, .about-particles', { autoAlpha: 0 });
        this.aboutComponent.setParallaxReady(false);
        about.inert = true;
        about.setAttribute('aria-hidden', 'true');
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: () => {
            const visible = timeline.time() >= timeline.labels['aboutCentered'];
            about.inert = !visible;
            about.setAttribute('aria-hidden', String(!visible));
            download.inert = timeline.time() < timeline.labels['headersComplete'];
            hero.inert = timeline.time() >= timeline.labels['logoVisible'];
            this.aboutComponent.setParallaxReady(timeline.time() >= timeline.labels['aboutReady']);
            this.updateActiveSection();
          }
        });
        timeline
          .set(composition, { y: () => settledY }, 0)
          .to('.hero-copy, .hero-portrait, .hero-scroll, .hero-atmosphere', { autoAlpha: 0, y: '-=80', duration: 0.25 }, 0)
          .to(this.quote.nativeElement, { autoAlpha: 1, duration: 0.12 }, 0.3)
          .to(words, { opacity: 1, duration: 0.06, stagger: { amount: 0.27 } }, 0.42)
          .to('.quote-mark', { opacity: 1, duration: 0.1 }, 0.75)
          .addLabel('logoVisible', 0.25)
          .addLabel('quoteExplore', 0.48)
          .addLabel('quoteComplete', 0.85)
          .to({}, { duration: 0.25 }, 0.85)
          .addLabel('aboutEnter', 1.1)
          .to(this.quote.nativeElement, { autoAlpha: 0, duration: 0.4 }, 'aboutEnter')
          .addLabel('quoteGone', 1.5)
          .addLabel('cardEnter', 'quoteGone+=0.08')
          .set(about, { autoAlpha: 1 }, 'cardEnter')
          .fromTo(card, { autoAlpha: 0, scale: 0.78, z: -420, filter: 'blur(18px)' }, {
            autoAlpha: 1, scale: 1, z: 0, filter: 'blur(0px)', duration: mobile ? 0.45 : 0.8, ease: 'power2.out'
          }, 'cardEnter')
          .addLabel('aboutCentered', mobile ? 'cardEnter+=0.45' : 'cardEnter+=0.8')
          .addLabel('cardCentered', 'aboutCentered')
          .set(card, { filter: 'none' }, 'aboutCentered')
          .addLabel('surroundingsEnter', mobile ? 'cardEnter+=0.15' : 'aboutCentered+=0.1')
          .fromTo('.about-heading', {
            autoAlpha: 0, y: (_: number, element: HTMLElement) => element.offsetHeight + 32
          }, { autoAlpha: 1, y: 0, duration: mobile ? 0.35 : 0.5, ease: 'power2.out' }, 'surroundingsEnter')
          .fromTo(download, {
            autoAlpha: 0, y: () => download.offsetHeight + 32
          }, { autoAlpha: 1, y: 0, duration: mobile ? 0.35 : 0.5, ease: 'power2.out' }, mobile ? 'surroundingsEnter' : 'surroundingsEnter+=0.06')
          .addLabel('headersComplete', mobile ? 'surroundingsEnter+=0.35' : 'surroundingsEnter+=0.56')
          .fromTo('.about-tech', {
            autoAlpha: 0,
            x: (index: number, element: HTMLElement) => mobile ? 0
              : (index < 4 ? 1 : -1) * ((element.parentElement?.clientWidth ?? 0) + element.offsetWidth),
            y: mobile ? -48 : 0
          }, { autoAlpha: 1, x: 0, y: 0, duration: mobile ? 0.4 : 0.55, stagger: mobile ? 0.015 : 0.04, ease: 'power2.out' }, mobile ? 'surroundingsEnter' : 'surroundingsEnter+=0.02')
          .addLabel('techComplete', mobile ? 'surroundingsEnter+=0.505' : 'surroundingsEnter+=0.85')
          .addLabel('surroundingsComplete', 'techComplete')
          .addLabel('lightEnter', mobile ? 'surroundingsEnter' : 'surroundingsComplete+=0.08')
          .to('.about-glow, .about-particles', { autoAlpha: 1, duration: mobile ? 0.4 : 0.5, ease: 'sine.inOut' }, 'lightEnter')
          .addLabel('aboutReady', mobile ? 'surroundingsComplete' : 'lightEnter+=0.5');
        // The first settled frame is the navigation destination. Short screens then
        // traverse the rest of the composition before the scene releases its pin.
        const travel = gsap.fromTo(composition, { y: () => settledY }, {
          y: () => settledY - overflow,
          duration: Math.max(0.0001, overflow / scrollUnit),
          ease: 'none', immediateRender: false
        });
        timeline.add(travel, mobile ? 'aboutReady+=0.08' : 'aboutReady+=0.25');
        const hold = gsap.to({}, { duration: mobile ? 0.12 : 0.45 });
        timeline.add(hold, travel.endTime());
        timeline.addLabel('overflowEnd', travel.endTime());
        this.sceneTimeline = timeline;
        this.quoteTrigger = ScrollTrigger.create({
          animation: timeline,
          trigger: scene,
          pin: true,
          start: () => `top top+=${stickyHeaderHeight()}`,
          end: () => `+=${scrollUnit * timeline.duration()}`,
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            measure();
            travel.duration(Math.max(0.0001, overflow / scrollUnit));
            hold.startTime(travel.endTime());
            timeline.addLabel('overflowEnd', travel.endTime());
          },
          onUpdate: () => this.updateActiveSection()
        });
        let active = true;
        let refreshFrame = 0;
        const refresh = () => {
          if (!active || refreshFrame) return;
          refreshFrame = requestAnimationFrame(() => {
            refreshFrame = 0;
            if (active) ScrollTrigger.refresh();
          });
        };
        // Observe only intrinsic content/header sizing, never the pin spacer.
        const layoutObserver = new ResizeObserver(refresh);
        layoutObserver.observe(composition);
        const header = document.getElementById('header');
        if (header) layoutObserver.observe(header);
        void document.fonts.ready.then(refresh);
        this.updateActiveSection();
        return () => {
          active = false;
          cancelAnimationFrame(refreshFrame);
          layoutObserver.disconnect();
          this.quoteTrigger = undefined;
          this.sceneTimeline = undefined;
          about.inert = false;
          download.inert = false;
          hero.inert = false;
          about.removeAttribute('aria-hidden');
          this.aboutComponent.setParallaxReady(true);
          scene.classList.remove('hero-scene-animated', 'about-scene-animated');
          this.updateActiveSection();
        };
      });
    } catch {
      this.animationMedia?.revert();
      this.aboutComponent.setParallaxReady(true);
      // Keep both sections readable in normal flow if animation cannot load.
    }
    if (!this.scrollLifetime.signal.aborted) this.updateActiveSection();
  }

  async explore(): Promise<void> {
    await this.animationReady;
    if (this.scrollLifetime.signal.aborted) return;
    const target = this.scenePosition('quoteExplore') ?? this.quote.nativeElement;
    await scrollToSection(target, this.scrollLifetime.signal);
  }

  async scroll(section: HTMLElement): Promise<void> {
    await this.animationReady;
    const target = section.id === 'about' ? this.scenePosition('aboutReady') ?? section : section;
    void scrollToSection(target, this.scrollLifetime.signal);
  }

  private scenePosition(label: string): number | undefined {
    if (!this.quoteTrigger || !this.sceneTimeline) return undefined;
    return Math.ceil(this.quoteTrigger.start + (this.quoteTrigger.end - this.quoteTrigger.start)
      * this.sceneTimeline.labels[label] / this.sceneTimeline.duration());
  }

  scrolltop(): void {
    void scrollToSection(0, this.scrollLifetime.signal);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateActiveSection(): void {
    this.headerScrolled = window.scrollY > 8;
    const threshold = stickyHeaderHeight() + 2;
    this.logoVisible = window.matchMedia('(max-width: 1023px)').matches || (this.quoteTrigger
      ? window.scrollY >= (this.scenePosition('logoVisible') ?? Infinity)
      : (this.heroScene.nativeElement.querySelector('.hero')?.getBoundingClientRect().bottom ?? Infinity) <= threshold);
    let active = 'home';
    for (const id of ['about', 'portfolio', 'contact']) {
      const reached = id === 'about' && this.sceneTimeline
        ? this.sceneTimeline.time() >= this.sceneTimeline.labels['aboutEnter']
        : (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= threshold;
      if (reached) active = id;
    }
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = 'contact';
    }
    this.activeSection = active;
  }

  ngOnDestroy(): void {
    this.scrollLifetime.abort();
    cancelAnimationFrame(this.loaderFrame);
    this.finishLoader();
    this.animationMedia?.revert();
    this.resizeObserver?.disconnect();
  }
}
