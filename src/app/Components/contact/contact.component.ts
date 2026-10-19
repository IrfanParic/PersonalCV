import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ContactComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
