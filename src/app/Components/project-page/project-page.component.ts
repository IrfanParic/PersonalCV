import {Component, HostListener, OnInit, Input } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectService} from "../../Services/project.service";
import {BeforeSlideDetail} from "lightgallery/lg-events";

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {
  project: any;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private router: Router
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

  goBack() {
    this.router.navigate(['']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (scrollOffset >= 110) {
      document.querySelectorAll('.controllable').forEach((c) => {
        c.classList.add('bgcolor');
      });
    } else {
      document.querySelectorAll('.controllable').forEach((c) => {
        c.classList.remove('bgcolor');
      });
    }
  }
}
