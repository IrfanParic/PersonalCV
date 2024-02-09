import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Project} from "../../Models/project";
import {ProjectService} from "../../Services/project.service";

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  public projects: Project[] = [];

  constructor(private projectService:ProjectService, private router:Router) {}

  ngOnInit(): void {

      this.projects = this.projectService.getProjects();

  }

  openProjectPage(projectId: string) {
    this.router.navigate([`/project-page/${projectId}`])
  }
}
