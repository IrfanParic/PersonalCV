import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Project} from "../Models/project";

import * as projectData from '../Data/projects.json'

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  data = projectData;

  constructor(private http: HttpClient) {}

  public getProjects(): Project[] {
    return this.data.projects
  }

}
