import {Injectable} from "@angular/core";
import {Project} from "../Models/project";

import * as projectData from '../Data/projects.json'
import {Observable, of} from "rxjs";


@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  data = projectData;

  public getProjects(): Project[] {
    return this.data.projects
  }

  public getProjectById(projectId: string): Observable<Project | undefined> {
    const project = this.data.projects.find((p) => p.id === projectId);
    return of(project);
  }

}
