import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
import type { gsap } from 'gsap';
import { loadGsap } from '../../platform/visual-tools';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private animationMedia?: gsap.MatchMedia;
  private destroyed = false;
  private parallaxReady = false;
  private resetParallax?: () => void;

  readonly technologies = [
    { name: 'Figma', icon: 'figma' },
    { name: 'React', icon: 'react' },
    { name: 'Angular', icon: 'angular' },
    { name: 'Vue', icon: 'vue' },
    { name: 'Node.js', icon: 'nodejs' },
    { name: 'Spring Boot', icon: 'spring' },
    { name: 'MySQL', icon: 'mysql' },
    { name: 'PostgreSQL', icon: 'postgree' }
  ];

  constructor(private readonly element: ElementRef<HTMLElement>, private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => void this.initializeParallax());
  }

  setParallaxReady(ready: boolean): void {
    if (this.parallaxReady === ready) return;
    this.parallaxReady = ready;
    if (!ready) this.resetParallax?.();
  }

  private async initializeParallax(): Promise<void> {
    try {
      const gsap = await loadGsap();
      if (this.destroyed) return;
      const host = this.element.nativeElement;
      const stage = host.querySelector<HTMLElement>('.about-stage');
      const composition = host.querySelector<HTMLElement>('.about-composition');
      const parallax = host.querySelector<HTMLElement>('.about-parallax');
      if (!stage || !composition || !parallax) return;
      this.animationMedia = gsap.matchMedia(host);
      this.animationMedia.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const lifetime = new AbortController();
        const motion = (target: HTMLElement, property: string) => gsap.quickTo(target, property, { duration: 0.7, ease: 'power3.out' });
        gsap.set(parallax, { transformPerspective: 1200 });
        const moveX = motion(parallax, 'x');
        const moveY = motion(parallax, 'y');
        const rotateX = motion(parallax, 'rotationX');
        const rotateY = motion(parallax, 'rotationY');
        const depth = Array.from(host.querySelectorAll<HTMLElement>('.about-depth, .about-tech-depth, .about-glow, .about-particles')).map((target, index) => ({
          x: motion(target, 'x'),
          y: motion(target, 'y'),
          amount: target.matches('.about-glow, .about-particles') ? 18
            : target.classList.contains('about-tech-depth') ? 4 + index % 3 : target.closest('.about-download') ? 9 : 5
        }));
        const move = (x: number, y: number) => {
          moveX(x * 6);
          moveY(y * 6);
          rotateX(-y * 2);
          rotateY(x * 2);
          depth.forEach(layer => {
            layer.x(x * layer.amount);
            layer.y(y * layer.amount);
          });
        };
        this.resetParallax = () => {
          move(0, 0);
          for (const quickTo of [moveX, moveY, rotateX, rotateY, ...depth.flatMap(layer => [layer.x, layer.y])]) {
            quickTo.tween.progress(1).pause();
          }
        };
        stage.addEventListener('pointermove', event => {
          if (!this.parallaxReady || event.pointerType !== 'mouse' || getComputedStyle(composition).visibility === 'hidden') return;
          const bounds = stage.getBoundingClientRect();
          const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
          const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
          move(x, y);
        }, { passive: true, signal: lifetime.signal });
        stage.addEventListener('pointerleave', () => move(0, 0), { signal: lifetime.signal });
        return () => {
          lifetime.abort();
          this.resetParallax = undefined;
        };
      });
    } catch {
      this.animationMedia?.revert();
      // The card and download remain usable when optional motion cannot load.
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.animationMedia?.revert();
  }
}
