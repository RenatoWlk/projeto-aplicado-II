import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { registerLocaleData } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { LOCALE_ID, isDevMode } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { provideServiceWorker } from '@angular/service-worker';

registerLocaleData(localePt);

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    { provide: LOCALE_ID, useValue:'pt-BR' }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
})
.catch(err => console.error(err));
