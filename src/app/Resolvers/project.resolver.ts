import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from 'rxjs';
import {ProjectService} from "../Services/project.service";
import {Project} from "../Models/project";

@Injectable({providedIn: 'root'})
export class ProjectResolver implements Resolve<Project[]> {

  constructor(private projectService:ProjectService) {
  }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
    Observable<Project[]> | Promise<Project[]> | Project[]{
    return this.projectService.getProjects();
  }
}
