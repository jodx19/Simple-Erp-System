import { Component, inject, ViewChild, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Product, ProductCreateDto } from '../../../core/api/erp.api';
import { ProductService } from '../../../core/services/product.service';
import { ProductFormDialogComponent } from '../product-form-dialog/product-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatDividerModule,
    NgChartsModule
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsListComponent implements OnInit, AfterViewInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['name', 'sku', 'category', 'supplier', 'price', 'stock', 'status', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  allProducts: Product[] = [];
  isLoading = false;

  // KPIs
  totalProducts = 0;
  inventoryValue = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  // Filters
  searchTerm = '';
  selectedCategory = 'All';
  selectedStatus = 'All';
  selectedStockStatus = 'All';
  categories: string[] = [];

  // Charts Options
  public commonChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#cbd5e1' } },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    }
  };

  // Bar Chart: Stock Value by Category
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Inventory Value ($)',
      backgroundColor: '#3b82f6',
      borderRadius: 4
    }]
  };
  public barChartOptions: any = {
    ...this.commonChartOptions,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  // Line Chart: Inventory Movement Mock
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Stock In', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Stock Out', borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.1)', fill: true, tension: 0.4 }
    ]
  };
  public lineChartOptions: any = {
    ...this.commonChartOptions,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  // Doughnut Chart: Low Stock Distribution
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
  public doughnutChartOptions: any = {
    ...this.commonChartOptions,
    cutout: '70%',
    plugins: {
      ...this.commonChartOptions?.plugins,
      legend: { position: 'right', labels: { color: '#cbd5e1', usePointStyle: true } }
    }
  };

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }
  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  ngOnInit(): void {
    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Product, filter: string): boolean => {
      const searchStr = ((data.name || '') + (data.sku || '') + (data.category?.name || '')).toLowerCase();
      const matchesSearch = searchStr.includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = this.selectedCategory === 'All' || data.category?.name === this.selectedCategory;
      const matchesStatus = this.selectedStatus === 'All' || 
                           (this.selectedStatus === 'Active' ? data.isActive : !data.isActive);
      
      let matchesStock = true;
      if (this.selectedStockStatus === 'Low') {
        matchesStock = this.isLowStock(data);
      } else if (this.selectedStockStatus === 'Out') {
        matchesStock = data.stockQuantity === 0;
      } else if (this.selectedStockStatus === 'Healthy') {
        matchesStock = (data.stockQuantity ?? 0) > (data.lowStockThreshold ?? 5);
      }
      
      return !!(matchesSearch && matchesCategory && matchesStatus && matchesStock);
    };

    this.refreshTable();
  }

  ngAfterViewInit(): void {}

  applyFilters(): void {
    // Trigger the filter. The value doesn't matter much as long as it's something that changes.
    // We just need to trigger the filterPredicate.
    this.dataSource.filter = Math.random().toString();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.cdr.detectChanges();
  }

  isLowStock(product: Product): boolean {
    const qty = product.stockQuantity ?? 0;
    const threshold = product.lowStockThreshold ?? 5;
    return qty > 0 && qty <= threshold;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: null,
    });
    dialogRef.afterClosed().subscribe((result: ProductCreateDto | undefined) => {
      if (result) {
        this.productService.addProduct(result).subscribe({
          next: () => {
            this.showSuccess('Product added successfully');
            this.refreshTable();
          },
          error: () => this.showError('Failed to add product'),
        });
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { ...product },
    });
    dialogRef.afterClosed().subscribe((result: ProductCreateDto | undefined) => {
      if (result) {
        this.productService.updateProduct(product.id!, result).subscribe({
          next: () => {
            this.showSuccess('Product updated successfully');
            this.refreshTable();
          },
          error: () => this.showError('Failed to update product'),
        });
      }
    });
  }

  openDeleteDialog(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
        icon: 'delete_forever',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.productService.deleteProduct(product.id!).subscribe({
          next: () => {
            this.showSuccess('Product deleted permanently');
            this.refreshTable();
          },
          error: () => this.showError('Failed to delete product'),
        });
      }
    });
  }

  onToggleStatus(product: Product): void {
    const action = product.isActive ? 'Deactivate' : 'Activate';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: `${action} Product`,
        message: `${action} "${product.name}"?`,
        confirmText: action,
        confirmColor: product.isActive ? 'warn' : 'primary',
        icon: product.isActive ? 'block' : 'check_circle',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isLoading = true;
        this.cdr.detectChanges();
        this.productService.toggleStatus(product).subscribe({
          next: () => {
            this.showSuccess(`Product ${action.toLowerCase()}d successfully`);
            this.refreshTable();
          },
          error: (err) => {
            if (err.status === 409) {
              this.showError('Concurrency error: The product was updated by another user.');
            } else {
              this.showError(`Failed to ${action.toLowerCase()} product`);
            }
            this.refreshTable();
          },
        });
      }
    });
  }

  handleMockAction(actionName: string, productName: string | undefined): void {
    this.snackBar.open(`${actionName} initiated for ${productName || 'product'}`, 'Close', {
      duration: 3000,
      panelClass: 'info-snackbar',
    });
  }

  private refreshTable(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.dataSource.data = products;
        this.calculateMetrics(products);
        this.generateChartData(products);
        this.extractCategories(products);
        this.applyFilters(); // Apply filters against new data
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showError('Failed to load products');
        this.cdr.detectChanges();
      },
    });
  }

  private calculateMetrics(products: Product[]): void {
    this.totalProducts = products.length;
    this.inventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stockQuantity || 0)), 0);
    this.outOfStockCount = products.filter(p => !p.stockQuantity).length;
    this.lowStockCount = products.filter(p => this.isLowStock(p)).length;
  }

  private extractCategories(products: Product[]): void {
    const caps = products.map(p => p.category?.name).filter(Boolean) as string[];
    this.categories = [...new Set(caps)];
  }

  private generateChartData(products: Product[]): void {
    // 1. Bar Chart: Value by Category
    const valueByCategory: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.category?.name || 'Uncategorized';
      valueByCategory[cat] = (valueByCategory[cat] || 0) + ((p.price || 0) * (p.stockQuantity || 0));
    });

    this.barChartData = {
      labels: Object.keys(valueByCategory),
      datasets: [{
        data: Object.values(valueByCategory),
        label: 'Inventory Value ($)',
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    };

    // 2. Doughnut Chart: Low Stock by Category
    const lowStockByCategory: Record<string, number> = {};
    const lowStockProducts = products.filter(p => this.isLowStock(p));
    lowStockProducts.forEach(p => {
      const cat = p.category?.name || 'Uncategorized';
      lowStockByCategory[cat] = (lowStockByCategory[cat] || 0) + 1;
    });

    this.doughnutChartData = {
      labels: Object.keys(lowStockByCategory).length ? Object.keys(lowStockByCategory) : ['No Low Stock'],
      datasets: [{
        data: Object.keys(lowStockByCategory).length ? Object.values(lowStockByCategory) : [1],
        backgroundColor: Object.keys(lowStockByCategory).length ? ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'] : ['#334155'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 3500, panelClass: 'success-snackbar' });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
  }
}
