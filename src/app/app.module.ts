import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './Components/welcome/welcome.component';
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { PageUnavailableComponent } from './Components/page-unavailable/page-unavailable.component';
import {PortfolioComponent} from "./Components/portfolio/portfolio.component";
import {AboutComponent} from "./Components/about/about.component";
import {ContactComponent} from "./Components/contact/contact.component";
import { ProjectPageComponent } from './Components/project-page/project-page.component';
import { FooterComponent } from './Components/footer/footer.component';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    PageNotFoundComponent,
    PageUnavailableComponent,
    PortfolioComponent,
    AboutComponent,
    ContactComponent,
    ProjectPageComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideZoneChangeDetection()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
