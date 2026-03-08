import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ErpApiClient, Customer, Order } from '../../../core/api/erp.api';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule, 
    MatDividerModule, 
    MatTooltipModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSidenavModule,
    FormsModule,
    NgChartsModule
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersListComponent implements OnInit {
  private api = inject(ErpApiClient);
  private cdr = inject(ChangeDetectorRef);

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  isLoading = true;
  
  // Refined Detailed Columns
  displayedColumns = [
    'customer', 
    'contact', 
    'segment', 
    'loyalty', 
    'financials', 
    'status', 
    'actions'
  ];

  // --- KPI Metrics ---
  totalCustomers = 0;
  activeCustomers = 0;
  outstandingBalance = 0;
  newCustomersThisMonth = 0;
  vipCustomersCount = 0;
  atRiskCustomersCount = 0;

  // --- Chart Configurations ---
  // 1. Customer Growth Trend (Line)
  public growthChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [12, 19, 15, 25, 22, 30, 28],
      label: 'New Customers',
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  };

  public growthChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, border: { display: false }}
    }
  };

  // 2. Payment Distribution (Doughnut)
  public paymentChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Cash', 'Visa'],
    datasets: [{ 
      data: [0, 0], 
      backgroundColor: ['#f97316', '#6366f1'], 
      hoverBackgroundColor: ['#fb923c', '#818cf8'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  public paymentChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', usePointStyle: true, font: { size: 11 } } }
    }
  };

  // 3. Loyalty Tier Distribution (Bar)
  public loyaltyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Bronze', 'Silver', 'Gold', 'VIP'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#d97706', '#94a3b8', '#eab308', '#ec4899'],
      borderRadius: 4
    }]
  };

  public loyaltyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, border: { display: false }}
    }
  };

  // 4. Balances by Segment (Bar - Horizontal)
  public balanceChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Retail', 'Walk-in', 'Enterprise', 'Wholesale'],
    datasets: [{
      data: [1200, 300, 8500, 2450],
      backgroundColor: '#a855f7',
      borderRadius: 4
    }]
  };

  public balanceChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, border: { display: false }},
      y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  // --- Filtering properties ---
  searchTerm = '';
  statusFilter = 'all';
  tierFilter = 'all';

  ngOnInit() {
    this.api.customersAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.calculateAnalytics(data);
        this.applyFilters();
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private calculateAnalytics(customers: Customer[]): void {
    this.totalCustomers = customers.length;
    
    let active = 0;
    let balance = 0;
    let vip = 0;
    let atRisk = 0;
    let cashPref = 0;
    let visaPref = 0;

    let bronze = 0, silver = 0, gold = 0;

    const now = new Date();

    customers.forEach(c => {
      // Mock logic for status/tier calculations if data is limited
      const points = c.loyaltyPoints || 0;
      balance += (c.balance || 0);
      
      // Determine tier by points
      if (points > 5000) { vip++; }
      else if (points > 2000) { gold++; }
      else if (points > 500) { silver++; }
      else { bronze++; }

      // Mock active logic based on email length (purely for visual variation setup)
      if ((c.email?.length || 0) % 2 === 0) { 
        active++;
        visaPref++;
      } else {
        atRisk++;
        cashPref++;
      }
    });

    this.activeCustomers = active || (this.totalCustomers > 0 ? this.totalCustomers - 2 : 0);
    this.outstandingBalance = balance || 12450; // Mock fallback
    this.newCustomersThisMonth = 48; // Hardcoded mock for dashboard vibe
    this.vipCustomersCount = vip || 12;
    this.atRiskCustomersCount = atRisk || 5;

    // Update dynamically backed charts
    this.paymentChartData = {
      ...this.paymentChartData,
      datasets: [{ ...this.paymentChartData.datasets[0], data: [cashPref || 60, visaPref || 40] }]
    };

    this.loyaltyChartData = {
      ...this.loyaltyChartData,
      datasets: [{ ...this.loyaltyChartData.datasets[0], data: [bronze || 40, silver || 30, gold || 15, vip || 15] }]
    };
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(c => {
      const matchSearch = !this.searchTerm || 
        c.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        c.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchSearch;
    });
  }

  // --- Display Helpers ---
  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getLoyaltyTier(points: number | undefined): { label: string, class: string } {
    const p = points || 0;
    if (p > 5000) return { label: 'VIP', class: 'tier-vip' };
    if (p > 2000) return { label: 'Gold', class: 'tier-gold' };
    if (p > 500) return { label: 'Silver', class: 'tier-silver' };
    return { label: 'Bronze', class: 'tier-bronze' };
  }

  getMockSegment(customer: Customer): string {
    const id = customer.id || 0;
    if (id % 3 === 0) return 'Enterprise';
    if (id % 2 === 0) return 'Wholesale';
    return 'Retail';
  }

  getMockStatus(customer: Customer): { label: string, class: string } {
    const id = customer.id || 0;
    if (id % 7 === 0) return { label: 'Overdue', class: 'status-overdue' }; // Red
    if (id % 5 === 0) return { label: 'Inactive', class: 'status-inactive' }; // Gray
    return { label: 'Active', class: 'status-active' }; // Green
  }
}
