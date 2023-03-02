import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import {Routex} from "./Constants/constants";
import {WelcomeComponent} from "./Components/welcome/welcome.component";
//import {ResolverResponse} from "./Constants/resolver-response.constants";
//import {ProjectResolver} from "./Resolvers/project.resolver";
import {PageUnavailableComponent} from "./Components/page-unavailable/page-unavailable.component";
import {PageNotFoundComponent} from "./Components/page-not-found/page-not-found.component";
//import {PortfolioComponent} from "./Components/portfolio/portfolio.component";
import {AboutComponent} from "./Components/about/about.component";
import {ContactComponent} from "./Components/contact/contact.component";

const routes: Routes = [
  {
    path: Routex.EMPTY,
    component: WelcomeComponent,
    resolve: {
      //[ResolverResponse.projects]: ProjectResolver,
    }
  },

  /* {
     path: Routex.EMPTY,
     component: PortfolioComponent,
     resolve: {
       [ResolverResponse.projects]: ProjectResolver,
     }
   },*/

  {
    path: Routex.EMPTY,
    component: AboutComponent,
  },

  {
    path: Routex.EMPTY,
    component: ContactComponent,
  },

  {
   path: Routex.EMPTY,
   children:[{
     path: Routex.PAGEUNAVAILABLE,
     component: PageUnavailableComponent,
   }]
  },

  {
    path: '**',
    component: PageNotFoundComponent,
  }
  ]

@NgModule({
  imports: [
    RouterModule.forRoot(routes,{useHash:true})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
