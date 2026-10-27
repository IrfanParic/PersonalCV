import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SeoService } from './Services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AppComponent {
  title = 'irfanparic';

  constructor(seo: SeoService) {
    seo.initialize();
  }
}
