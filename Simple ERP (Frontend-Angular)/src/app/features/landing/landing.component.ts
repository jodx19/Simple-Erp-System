import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  features = [
    {
      icon: 'dashboard',
      title: 'Dashboard Analytics',
      description: 'Real-time KPIs and business intelligence with interactive charts and reports',
    },
    {
      icon: 'shopping_cart',
      title: 'Orders Management',
      description: 'Complete order lifecycle from creation to fulfillment with status tracking',
    },
    {
      icon: 'people',
      title: 'CRM & Customers',
      description: 'Customer relationship management with contact history and segmentation',
    },
    {
      icon: 'local_shipping',
      title: 'Suppliers (SRM)',
      description: 'Supplier relationship management and procurement tracking',
    },
    {
      icon: 'point_of_sale',
      title: 'POS System',
      description: 'Point of sale interface for retail operations with receipt generation',
    },
    {
      icon: 'inventory_2',
      title: 'Inventory Management',
      description: 'Stock tracking, low stock alerts, and warehouse organization',
    },
    {
      icon: 'admin_panel_settings',
      title: 'Role-Based Access',
      description: 'Admin, Manager, and Employee roles with granular permissions',
    },
    {
      icon: 'history',
      title: 'Activity Trail',
      description: 'Complete audit log of all system activities for compliance',
    },
  ];

  techStack = [
    { name: 'Angular', icon: 'angular', category: 'Frontend' },
    { name: 'TypeScript', icon: 'code', category: 'Frontend' },
    { name: 'Angular Material', icon: 'palette', category: 'UI' },
    { name: 'SCSS', icon: 'style', category: 'Styling' },
    { name: 'Chart.js', icon: 'insert_chart', category: 'Charts' },
    { name: 'ASP.NET Core', icon: 'web', category: 'Backend' },
    { name: 'Entity Framework', icon: 'storage', category: 'Backend' },
    { name: 'SQL Server', icon: 'database', category: 'Database' },
    { name: 'JWT Auth', icon: 'security', category: 'Security' },
  ];

  screenshots = [
    { src: 'assets/screenshots/dashboard.png', title: 'Dashboard', description: 'Analytics & KPIs' },
    { src: 'assets/screenshots/orders.png', title: 'Orders', description: 'Order Management' },
    { src: 'assets/screenshots/customers.png', title: 'Customers', description: 'CRM Module' },
    { src: 'assets/screenshots/pos.png', title: 'POS', description: 'Point of Sale' },
    { src: 'assets/screenshots/inventory.png', title: 'Inventory', description: 'Stock Management' },
    { src: 'assets/screenshots/suppliers.png', title: 'Suppliers', description: 'SRM Module' },
  ];

  demoAccounts = [
    {
      role: 'Admin',
      email: 'admin@erp.com',
      password: 'Admin123!',
      color: '#f97316',
      permissions: ['Full System Access', 'User Management', 'Settings', 'All Reports'],
    },
    {
      role: 'Manager',
      email: 'manager@erp.com',
      password: 'Manager123!',
      color: '#14b8a6',
      permissions: ['Dashboard', 'Orders', 'POS', 'Inventory', 'Reports'],
    },
    {
      role: 'Employee',
      email: 'employee@erp.com',
      password: 'Employee123!',
      color: '#6366f1',
      permissions: ['POS', 'View Orders', 'View Customers'],
    },
  ];

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
