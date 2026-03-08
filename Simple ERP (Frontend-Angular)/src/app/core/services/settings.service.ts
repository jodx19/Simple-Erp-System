import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, filter, take, tap } from 'rxjs';
import { ErpApiClient, CompanySettings } from '../api/erp.api';

export type { CompanySettings };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private api = inject(ErpApiClient);

  private readonly settingsSubject = new BehaviorSubject<CompanySettings | null>(null);
  readonly settings$ = this.settingsSubject.asObservable();

  private fetchSettings(): Observable<CompanySettings> {
    return this.api
      .settingsGET()
      .pipe(tap((settings) => this.settingsSubject.next(settings)));
  }

  loadSettings(): Observable<CompanySettings> {
    if (!this.settingsSubject.value) {
      return this.fetchSettings();
    }
    return this.settings$.pipe(
      filter((s): s is CompanySettings => !!s),
      take(1)
    );
  }

  refreshSettings(): Observable<CompanySettings> {
    return this.fetchSettings();
  }

  updateSettings(body: CompanySettings): Observable<void> {
    return this.api
      .settingsPUT(body)
      .pipe(tap(() => this.settingsSubject.next({ ...body })));
  }
}
