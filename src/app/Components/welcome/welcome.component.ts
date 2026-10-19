import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, OnDestroy } from '@angular/core';
import { scrollToSection, stickyHeaderHeight } from '../../platform/visual-tools';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class WelcomeComponent implements AfterViewInit, OnDestroy {
  headerScrolled = false;
  activeSection = 'home';
  private readonly scrollLifetime = new AbortController();
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.updateActiveSection());
    for (const id of ['header', 'main']) {
      const element = document.getElementById(id);
      if (element) this.resizeObserver.observe(element);
    }
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
    this.resizeObserver?.disconnect();
  }
}
