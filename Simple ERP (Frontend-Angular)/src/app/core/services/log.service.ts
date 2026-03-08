import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ErpApiClient, ActivityLog } from '../api/erp.api';

@Injectable({ providedIn: 'root' })
export class LogService {
  private api = inject(ErpApiClient);

  getLogs(): Observable<ActivityLog[]> {
    return this.api.logs();
  }
}
