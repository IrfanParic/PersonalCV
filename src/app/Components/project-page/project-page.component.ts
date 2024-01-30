import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {ProjectService} from "../../Services/project.service";

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {
  project: any;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const projectId = params.get('projectId');
      if (projectId) {
        this.projectService.getProjectById(projectId).subscribe((project) => {
          this.project = project;
        });
      }
    });
  }

}
