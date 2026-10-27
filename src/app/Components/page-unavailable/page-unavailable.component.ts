import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-unavailable',
  templateUrl: './page-unavailable.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class PageUnavailableComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
