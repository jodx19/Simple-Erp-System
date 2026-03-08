import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ErpApiClient, Supplier } from '../../../core/api/erp.api';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatTooltipModule,
    MatDividerModule,
    MatRippleModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgChartsModule
  ],
  templateUrl: './suppliers-list.component.html',
  styleUrl: './suppliers-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuppliersListComponent implements OnInit {
  private api = inject(ErpApiClient);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  allSuppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  isLoading = true;
  
  displayedColumns = [
    'supplier', 
    'contact', 
    'category', 
    'metrics', 
    'status', 
    'actions'
  ];
  
  selectedSupplier: Supplier | null = null;
  
  // Filters
  searchTerm = '';
  categoryFilter = 'All';
  statusFilter = 'All';

  // --- KPI Metrics ---
  totalSuppliers = 0;
  activeSuppliers = 0;
  pendingDeliveries = 0;
  averageLeadTime = 0;
  topSupplierName = 'N/A';
  attentionRequired = 0;
  openPurchaseOrders = 0;
  categoriesCovered = 0;

  // --- Chart Configurations ---

  // 1. Supplier Performance Trend (Line)
  public performanceChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'],
    datasets: [{
      data: [82, 85, 88, 86, 92, 95],
      label: 'On-Time Delivery %',
      borderColor: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  };
  public performanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, border: { display: false }, min: 50, max: 100 }
    }
  };

  // 2. Category Distribution (Doughnut)
  public categoryChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Electronics', 'Furniture', 'Clothing', 'Food', 'General'],
    datasets: [{ 
      data: [0, 0, 0, 0, 0], 
      backgroundColor: ['#ff6600', '#2196f3', '#9c27b0', '#e91e63', '#607d8b'], 
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
  public categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { color: '#fff', usePointStyle: true, boxWidth: 8 } }
    }
  };

  // 3. Lead Time Comparison (Bar)
  public leadTimeChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Avg Lead Time (Days)',
      backgroundColor: '#ff9800',
      borderRadius: 4
    }]
  };
  public leadTimeChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, border: { display: false } }
    }
  };

  // 4. Status Breakdown (Doughnut)
  public statusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Active', 'Delayed', 'Inactive', 'High Risk'],
    datasets: [{ 
      data: [0, 0, 0, 0], 
      backgroundColor: ['#4caf50', '#ff9800', '#9e9e9e', '#f44336'], 
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
  public statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#fff', usePointStyle: true, boxWidth: 8 } }
    }
  };

  ngOnInit() {
    this.api.suppliersAll().subscribe({
      next: (data) => {
        this.allSuppliers = data || [];
        this.filteredSuppliers = [...this.allSuppliers];
        this.calculateMetrics();
        this.setupCharts();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateMetrics() {
    this.totalSuppliers = this.allSuppliers.length;
    
    let totalLeadTime = 0;
    let leadTimeCount = 0;
    const categories = new Set<string>();

    this.allSuppliers.forEach(s => {
      // Mocking active status based on dates/debt for richer UI
      const status = this.getMockStatus(s);
      if (status.val === 'Active') this.activeSuppliers++;
      if (status.val === 'Delayed' || status.val === 'High Risk') this.attentionRequired++;
      
      if (s.leadTimeDays) {
        totalLeadTime += s.leadTimeDays;
        leadTimeCount++;
      }
      
      if (s.supplyCategory) categories.add(s.supplyCategory);
    });

    this.averageLeadTime = leadTimeCount ? parseFloat((totalLeadTime / leadTimeCount).toFixed(1)) : 0;
    this.categoriesCovered = categories.size;
    this.pendingDeliveries = Math.floor(Math.random() * 20) + 5; // Simulated
    this.openPurchaseOrders = Math.floor(this.totalSuppliers * 0.4); // Simulated

    if (this.allSuppliers.length > 0) {
      // Best performer (Lowest Lead Time, Highest "Rating")
      const top = [...this.allSuppliers].sort((a, b) => (a.leadTimeDays ?? 99) - (b.leadTimeDays ?? 99))[0];
      this.topSupplierName = top.name || 'N/A';
    }
  }

  setupCharts() {
    // Category Breakdown
    const catCounts: Record<string, number> = { 'Electronics': 0, 'Furniture': 0, 'Clothing': 0, 'Food': 0, 'General': 0 };
    this.allSuppliers.forEach(s => {
      if (s.supplyCategory) {
        const cat = s.supplyCategory;
        if (catCounts[cat] !== undefined) catCounts[cat]++;
        else catCounts['General']++;
      } else {
        catCounts['General']++;
      }
    });
    this.categoryChartData.datasets[0].data = Object.values(catCounts);

    // Lead Time Comparison
    const leadTimesByCat: Record<string, { total: number, count: number }> = {};
    this.allSuppliers.forEach(s => {
      const cat = s.supplyCategory || 'General';
      if (!leadTimesByCat[cat]) leadTimesByCat[cat] = { total: 0, count: 0 };
      if (s.leadTimeDays) {
        leadTimesByCat[cat].total += s.leadTimeDays;
        leadTimesByCat[cat].count++;
      }
    });
    
    const leadsLabels = Object.keys(leadTimesByCat).slice(0, 5);
    const leadsData = leadsLabels.map(cat => {
      const d = leadTimesByCat[cat];
      return d.count ? parseFloat((d.total / d.count).toFixed(1)) : 0;
    });

    this.leadTimeChartData.labels = leadsLabels.length ? leadsLabels : ['Electronics', 'General'];
    this.leadTimeChartData.datasets[0].data = leadsData.length ? leadsData : [5, 3];

    // Status Breakdown
    const statusCounts = { active: 0, delayed: 0, inactive: 0, risk: 0 };
    this.allSuppliers.forEach(s => {
      const st = this.getMockStatus(s).val;
      if (st === 'Active') statusCounts.active++;
      else if (st === 'Delayed') statusCounts.delayed++;
      else if (st === 'Inactive') statusCounts.inactive++;
      else statusCounts.risk++;
    });
    this.statusChartData.datasets[0].data = [statusCounts.active, statusCounts.delayed, statusCounts.inactive, statusCounts.risk];
  }

  applyFilters() {
    this.filteredSuppliers = this.allSuppliers.filter(s => {
      const matchesSearch = !this.searchTerm || 
                            s.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            s.contactPerson?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = this.categoryFilter === 'All' || 
                              s.supplyCategory === this.categoryFilter ||
                              (!s.supplyCategory && this.categoryFilter === 'General');
      
      const matchesStatus = this.statusFilter === 'All' || 
                            this.getMockStatus(s).val.toLowerCase() === this.statusFilter.toLowerCase();
                            
      return matchesSearch && matchesCategory && matchesStatus;
    });
    this.cdr.detectChanges();
  }

  // --- UI Helpers ---

  getInitials(name: string | undefined): string {
    if (!name) return '??';
    return name.substring(0, 2).toUpperCase();
  }

  getMockStatus(s: Supplier): { val: string, class: string } {
    if (s.isActive === false) return { val: 'Inactive', class: 'status-inactive' };
    if ((s.outstandingDebts || 0) > 5000 && (s.leadTimeDays || 0) > 7) return { val: 'High Risk', class: 'status-risk' };
    if ((s.leadTimeDays || 0) > 5) return { val: 'Delayed', class: 'status-delayed' };
    return { val: 'Active', class: 'status-active' };
  }

  getPerformanceIndicator(s: Supplier): { label: string, color: string } {
    if (!s.leadTimeDays) return { label: 'Unknown', color: '#9e9e9e' };
    if (s.leadTimeDays <= 3) return { label: 'Excellent (98%)', color: '#4caf50' };
    if (s.leadTimeDays <= 5) return { label: 'Good (85%)', color: '#2196f3' };
    if (s.leadTimeDays <= 7) return { label: 'Average (70%)', color: '#ff9800' };
    return { label: 'Poor (<60%)', color: '#f44336' };
  }

  getCategoryColorClass(cat: string | undefined): string {
    const c = (cat || 'general').toLowerCase();
    if (c.includes('electronic')) return 'badge-orange';
    if (c.includes('furniture')) return 'badge-blue';
    if (c.includes('clothing')) return 'badge-purple';
    if (c.includes('food')) return 'badge-pink';
    return 'badge-gray';
  }

  openProfile(supplier: Supplier, drawer: any) {
    this.selectedSupplier = supplier;
    this.cdr.detectChanges();
    drawer.toggle();
  }

  placeOrder(supplier: Supplier) {
    this.snackBar.open(`Initiating purchase workflow for ${supplier.name}...`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }
}

