import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LogService } from '../../core/services/log.service';
import { ActivityLog } from '../../core/api/erp.api';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsComponent implements OnInit {
  public logService = inject(LogService);
  public cdr = inject(ChangeDetectorRef);

  rawLogs: ActivityLog[] = [];
  logs: ActivityLog[] = [];
  isLoading = true;
  hasError = false;

  // KPI Metrics
  eventsToday = 0;
  userActionsCount = 0;
  warningsCount = 0;
  securityEventsCount = 0;

  // Filters State
  selectedUser = 'All';
  selectedAction = 'All';
  selectedModule = 'All';
  selectedSeverity = 'All';
  
  // Dynamic filter options
  users: string[] = [];
  actions: string[] = [];
  modules: string[] = [];

  ngOnInit(): void {
    this.loadLogs();
  }

  public loadLogs(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.detectChanges();
    this.logService.getLogs().subscribe({
      next: (data) => {
        this.rawLogs = data.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
        this.extractFilterOptions(this.rawLogs);
        this.calculateMetrics(this.rawLogs);
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private extractFilterOptions(data: ActivityLog[]) {
    this.users = [...new Set(data.map(log => log.user?.fullName || 'System').filter(Boolean))];
    this.actions = [...new Set(data.map(log => this.normalizeAction(log.action)).filter(Boolean))];
    this.modules = [...new Set(data.map(log => log.entityName).filter(Boolean))] as string[];
  }

  private normalizeAction(action: string | undefined): string {
    if (!action) return 'Unknown';
    const lower = action.toLowerCase();
    if (lower.includes('create')) return 'Create';
    if (lower.includes('update') || lower.includes('edit')) return 'Update';
    if (lower.includes('delete') || lower.includes('remove')) return 'Delete';
    if (lower.includes('login') || lower.includes('auth')) return 'Login';
    if (lower.includes('purchase') || lower.includes('sale')) return 'Purchase';
    if (lower.includes('stock')) return 'Stock Update';
    return action;
  }

  private calculateMetrics(data: ActivityLog[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayCount = 0;
    let usersCount = 0;
    let warnsCount = 0;
    let secCount = 0;

    data.forEach(log => {
      const logDate = log.timestamp ? new Date(log.timestamp) : new Date(0);
      if (logDate >= today) todayCount++;
      
      const normAction = this.normalizeAction(log.action);
      if (log.user?.fullName && log.user.fullName !== 'System') usersCount++;
      
      const severity = this.getSeverity(log.action, log.entityName);
      if (severity === 'warning') warnsCount++;
      if (severity === 'critical') warnsCount++; // sometimes considered warning/error
      if (normAction === 'Login') secCount++;
    });

    this.eventsToday = todayCount;
    this.userActionsCount = usersCount;
    this.warningsCount = warnsCount;
    this.securityEventsCount = secCount;
  }

  public applyFilters() {
    this.logs = this.rawLogs.filter(log => {
      const userName = log.user?.fullName || 'System';
      const normAction = this.normalizeAction(log.action);
      const mod = log.entityName || 'Unknown';
      const sev = this.getSeverity(log.action, mod);

      const matchUser = this.selectedUser === 'All' || userName === this.selectedUser;
      const matchAction = this.selectedAction === 'All' || normAction === this.selectedAction;
      const matchModule = this.selectedModule === 'All' || mod === this.selectedModule;
      const matchSeverity = this.selectedSeverity === 'All' || sev.toLowerCase() === this.selectedSeverity.toLowerCase();

      return matchUser && matchAction && matchModule && matchSeverity;
    });
    this.cdr.detectChanges();
  }

  getInitials(name: string | undefined): string {
    if (!name || name === 'System') return 'SY';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getSeverity(action: string | undefined, entityName: string | undefined): string {
    if (!action) return 'info';
    const lower = action.toLowerCase();
    
    // Critical Cases
    if (lower.includes('delete') || lower.includes('remove') || lower.includes('deactivate')) {
      return 'critical';
    }
    // Warning Cases
    if (lower.includes('warning') || lower.includes('low') || lower.includes('failed') || lower.includes('error')) {
      return 'warning';
    }
    // Success Cases
    if (lower.includes('create') || lower.includes('success') || lower.includes('login') || lower.includes('purchase')) {
      return 'success';
    }
    
    return 'info';
  }

  getSeverityIcon(severity: string): string {
    switch(severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }

  getEntityLink(entityName: string | undefined): string {
    if (!entityName) return '/';
    const name = entityName.toLowerCase();
    if (name.includes('product') || name.includes('stock')) return '/inventory';
    if (name.includes('order') || name.includes('sale')) return '/orders';
    if (name.includes('customer')) return '/crm';
    if (name.includes('user')) return '/settings';
    return '/';
  }
}
