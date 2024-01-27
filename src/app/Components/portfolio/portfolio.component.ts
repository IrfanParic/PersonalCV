import { Component, OnInit } from '@angular/core';
import {ResolverResponse} from "../../Constants/resolver-response.constants";
import { ActivatedRoute } from "@angular/router";
import {Observable} from 'rxjs';
import {Project} from "../../Models/project";
import {ProjectService} from "../../Services/project.service";

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  public projects: Project[] = [];

  constructor(private projectService:ProjectService) {}

  ngOnInit(): void {

      this.projects = this.projectService.getProjects();

  }

}
