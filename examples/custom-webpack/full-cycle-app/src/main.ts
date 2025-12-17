import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '@app/app.component';
import { environment } from '@environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {providers: [provideZoneChangeDetection()]});
