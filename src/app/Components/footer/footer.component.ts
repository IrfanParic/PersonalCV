import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { scrollToSection } from '../../platform/visual-tools';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class FooterComponent implements OnDestroy {
  readonly year = new Date().getFullYear();
  private readonly scrollLifetime = new AbortController();

  scrolltop(): void {
    void scrollToSection(0, this.scrollLifetime.signal);
  }

  ngOnDestroy(): void {
    this.scrollLifetime.abort();
  }
}
