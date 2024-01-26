import { Component, OnInit } from '@angular/core';
//import {ResolverResponse} from "../../Constants/resolver-response.constants";
import { Router} from "@angular/router";
//import {Project} from "../../Models/project";

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  //public projects: Project[] = [];

  constructor(private router: Router) { }

  navigateToProjectPage() {
    // Your data to pass to the project-page component
    const dataToSend = { key: 'value', data: 'irfan' };

    // Navigating to the project-page component with data
    this.router.navigate(['/project-page'], { state: { data: dataToSend } });
  }

  ngOnInit(): void {
    /*this.activatedRoute.data.subscribe((response: any) => {
      this.projects = response[ResolverResponse.projects];
    });*/

  }

}
