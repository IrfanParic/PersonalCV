import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './Components/welcome/welcome.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatExpansionModule} from "@angular/material/expansion";
import { AppRoutingModule } from './app-routing.module';
import {ProjectService} from "./Services/project.service";
import {ProjectResolver} from "./Resolvers/project.resolver";
import {HttpClientModule} from "@angular/common/http";
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { PageUnavailableComponent } from './Components/page-unavailable/page-unavailable.component';
import {PortfolioComponent} from "./Components/portfolio/portfolio.component";
import {AboutComponent} from "./Components/about/about.component";
import {ContactComponent} from "./Components/contact/contact.component";


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    PageNotFoundComponent,
    PageUnavailableComponent,
    PortfolioComponent,
    AboutComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    ProjectService,
    ProjectResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
