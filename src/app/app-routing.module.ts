import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import {Routex} from "./Constants/constants";
import {WelcomeComponent} from "./Components/welcome/welcome.component";
import {ResolverResponse} from "./Constants/resolver-response.constants";
import {ProjectResolver} from "./Resolvers/project.resolver";

const routes: Routes = [
  {
    path: Routex.EMPTY,
    component: WelcomeComponent,
    resolve: {
      [ResolverResponse.projects]: ProjectResolver,
    }
  }

  ]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
