import { NgModule } from '@angular/core';
import { CanMatchFn, RouterModule, Routes } from '@angular/router';
import { projects } from './Data/projects.json';
import { WelcomeComponent } from './Components/welcome/welcome.component';
import { ProjectPageComponent } from './Components/project-page/project-page.component';
import { PageUnavailableComponent } from './Components/page-unavailable/page-unavailable.component';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';

const knownProject: CanMatchFn = (_route, segments) => projects.some(project => project.id === segments[1]?.path);

const routes: Routes = [
  { path: '', component: WelcomeComponent, pathMatch: 'full' },
  { path: 'project-page/:projectId', component: ProjectPageComponent, canMatch: [knownProject] },
  { path: 'page-unavailable', component: PageUnavailableComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
