/* import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Project} from "../Models/project";

@Injectable()
export class ProjectService {
 private readonly baseUrl: string = environment.backendUrl + '/projects';

  constructor(private http: HttpClient) {
  }

  public getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

} */
