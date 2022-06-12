import { Component, OnInit } from '@angular/core';
import * as AOS from 'aos';
import {Project} from "../../Models/project";
import {ActivatedRoute} from "@angular/router";
import {ResolverResponse} from "../../Constants/resolver-response.constants";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  public projects: Project[] = [];

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((response: any) => {
      this.projects = response[ResolverResponse.projects];
    });
    AOS.init();
  }

  scroll(div: HTMLDivElement) {
    div.scrollIntoView();
  }

  scrolltop() {
    window.scroll(0,0);
  }
}
