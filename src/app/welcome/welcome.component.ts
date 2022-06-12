import { Component, OnInit } from '@angular/core';
import * as AOS from 'aos';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    AOS.init();
  }

  scroll(div: HTMLDivElement) {
    div.scrollIntoView();
  }

  scrolltop() {
    window.scroll(0,0);
  }
}
