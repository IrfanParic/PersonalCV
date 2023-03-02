/*import { Component, OnInit } from '@angular/core';
import {ResolverResponse} from "../../Constants/resolver-response.constants";
import {ActivatedRoute} from "@angular/router";
import {Project} from "../../Models/project";

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  public projects: Project[] = [];

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((response: any) => {
      this.projects = response[ResolverResponse.projects];
    });
  }

}*/
