import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Project } from '../../Models/project';
import { ProjectService } from '../../Services/project.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class PortfolioComponent {
  readonly projects: Project[];
  readonly currentProjects: Project[];

  constructor(projectService: ProjectService) {
    this.projects = projectService.getProjects();
    this.currentProjects = this.projects.filter(project => project.active);
  }
}
