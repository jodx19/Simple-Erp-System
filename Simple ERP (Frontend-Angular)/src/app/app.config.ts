import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { NgChartsModule } from 'ng2-charts';
import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { deactivationInterceptor } from './core/interceptors/deactivation.interceptor';
import { ErpApiClient, API_BASE_URL } from './core/api/erp.api';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } },
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor, deactivationInterceptor])
    ),
    importProvidersFrom(NgChartsModule.forRoot()),
    ErpApiClient,
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  ],
};
