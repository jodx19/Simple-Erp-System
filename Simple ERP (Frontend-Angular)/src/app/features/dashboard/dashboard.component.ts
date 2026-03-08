import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangeDetectionStrategy } from '@angular/core';
import { ErpApiClient, Order, DashboardStatsDto, Product, SalesReportDto } from '../../core/api/erp.api';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatButtonModule,
    NgChartsModule,
    RouterModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private api = inject(ErpApiClient);
  private cdr = inject(ChangeDetectorRef);
  private productService = inject(ProductService);

  isLoading = true;
  hasError = false;
  stats: DashboardStatsDto | null = null;
  recentOrders: Order[] = [];
  displayedColumns: string[] = ['customer', 'date', 'amount', 'status'];

  // --- Chart Configurations ---
  public salesChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ 
      data: [], 
      label: 'Daily Revenue', 
      backgroundColor: '#6366f1', 
      borderRadius: 12,
      maxBarThickness: 32
    }]
  };

  public stockChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Active Assets', 'Low Stock/Inactive'],
    datasets: [{ 
      data: [0, 0], 
      backgroundColor: ['#10b981', '#f43f5e'], 
      borderColor: 'rgba(15, 23, 42, 0.8)',
      borderWidth: 4,
      hoverOffset: 20
    }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 12,
        displayColors: false
      }
    }
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      stats: this.api.dashboard().pipe(catchError(() => of(null))),
      orders: this.api.ordersAll().pipe(catchError(() => of([]))),
      products: this.productService.getProducts().pipe(catchError(() => of([]))),
      salesReport: this.api.sales({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ stats, orders, products, salesReport }) => {
        this.stats = stats;

        // Recent Orders
        this.recentOrders = [...orders].sort((a, b) =>
          new Date(b.orderDate!).getTime() - new Date(a.orderDate!).getTime()
        ).slice(0, 5);

        // Stock Distribution Chart
        const activeCount = products.filter(p => p.isActive !== false).length;
        const inactiveCount = products.length - activeCount;
        this.stockChartData = {
          ...this.stockChartData,
          datasets: [{ ...this.stockChartData.datasets[0], data: [activeCount, inactiveCount] }]
        };

        // Sales Trends Chart
        const trends = stats?.salesTrends || [];
        const labels = trends.length 
          ? trends.map(t => new Date(t.date!).toLocaleDateString(undefined, { weekday: 'short' }))
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = trends.length 
          ? trends.map(t => t.amount || 0)
          : [120, 450, 300, 700, 500, 900, 650];

        this.salesChartData = {
          ...this.salesChartData,
          labels,
          datasets: [{ ...this.salesChartData.datasets[0], data }]
        };

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: number | undefined): string {
    switch (status) {
      case 0: return 'pill-pending';
      case 1: return 'pill-success';
      case 2: return 'pill-cancelled';
      default: return 'pill-info';
    }
  }

  getStatusLabel(status: number | undefined): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Completed';
      case 2: return 'Cancelled';
      default: return 'Unknown';
    }
  }
}
