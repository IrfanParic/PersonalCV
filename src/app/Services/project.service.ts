import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Project} from "../Models/project";

import * as projectData from '../Data/projects.json'
import {Observable, of} from "rxjs";


@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  data = projectData;

  constructor(private http: HttpClient) {}

  public getProjects(): Project[] {
    return this.data.projects
  }

  public getProjectById(projectId: string): Observable<any> {
    const project = this.data.projects.find((p) => p.id === projectId);
    return of(project);
  }

}
