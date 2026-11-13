import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { serverRoutes } from './app.routes.server';

@NgModule({
  imports: [AppModule, ServerModule],
  providers: [provideServerRendering(withRoutes(serverRoutes))],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
