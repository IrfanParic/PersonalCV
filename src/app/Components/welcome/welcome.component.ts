import {Component, HostListener, OnInit} from '@angular/core';
import * as AOS from 'aos';
//import {Project} from "../../Models/project";
import {ActivatedRoute} from "@angular/router";
//import {ResolverResponse} from "../../Constants/resolver-response.constants";

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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (scrollOffset >= 110) {
      document.querySelectorAll('.controllable').forEach((c) => {
        c.classList.add('bgcolor');
      });
    } else {
      document.querySelectorAll('.controllable').forEach((c) => {
        c.classList.remove('bgcolor');
      });
    }
  }
}
