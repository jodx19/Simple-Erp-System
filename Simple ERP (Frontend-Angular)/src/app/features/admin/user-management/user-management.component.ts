import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErpApiClient, UserManagementDto } from '../../../core/api/erp.api';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSidenavModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit {
  private api = inject(ErpApiClient);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  users: UserManagementDto[] = [];
  filteredUsers: UserManagementDto[] = [];
  displayedColumns: string[] = ['user', 'email', 'role', 'permissions', 'lastLogin', 'status', 'actions'];
  isLoading = true;

  // Metrics
  metrics = {
    total: 0,
    active: 0,
    admins: 0,
    pending: 3 // Mocked
  };

  // Filters
  searchQuery = '';
  roleFilter = 'All';
  statusFilter = 'All';

  // Drawer
  selectedUser: UserManagementDto | null = null;
  isDrawerOpen = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.api.users().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.calculateMetrics();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateMetrics(): void {
    this.metrics.total = this.users.length;
    this.metrics.active = this.users.filter(u => u.isActive).length;
    this.metrics.admins = this.users.filter(u => u.role === 'Admin').length;
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchQuery || 
        user.fullName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesRole = this.roleFilter === 'All' || user.role === this.roleFilter;
      
      const matchesStatus = this.statusFilter === 'All' || 
        (this.statusFilter === 'Active' && user.isActive) ||
        (this.statusFilter === 'Inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
    this.cdr.detectChanges();
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onRoleChange(role: string): void {
    this.roleFilter = role;
    this.applyFilters();
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  viewUserDetails(user: UserManagementDto): void {
    this.selectedUser = user;
    this.isDrawerOpen = true;
    this.cdr.detectChanges();
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedUser = null;
    this.cdr.detectChanges();
  }

  toggleActive(user: UserManagementDto): void {
    if (!user.id) return;
    this.api.toggleStatus(user.id).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.calculateMetrics();
        this.snackBar.open(`Access for ${user.fullName} ${user.isActive ? 'restored' : 'suspended'}`, 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  updateRole(user: UserManagementDto, newRole: string): void {
    if (!user.id) return;
    this.api.updateRole(user.id, { selectedRole: newRole }).subscribe({
      next: () => {
        user.role = newRole;
        this.calculateMetrics();
        this.snackBar.open(`Role updated to ${newRole}`, 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  inviteUser(): void {
    this.snackBar.open('Invitation system initializing...', 'Close', { duration: 2000 });
  }
}
