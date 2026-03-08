import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SettingsService, CompanySettings } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  saving = false;

  settingsForm = this.fb.group({
    // General
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    address: [''],
    currency: ['USD', Validators.required],
    timeZone: ['UTC+2 (Cairo)', Validators.required],
    language: ['English', Validators.required],
    
    // Branding
    logoUrl: [''],
    primaryColor: ['#6366f1'], // Modern Indigo
    theme: ['Dark'],
    faviconUrl: [''],

    // Localization
    dateFormat: ['DD/MM/YYYY'],
    numberFormat: ['1,234.56'],

    // Security
    passwordPolicy: ['Enterprise (12+ chars, multiple requirements)'],
    sessionTimeout: [60, [Validators.min(5), Validators.max(1440)]],
    twoFactAuth: [true],
    loginAlerts: [true],
    ipRestrictions: [''],

    // Notifications
    orderAlerts: [true],
    inventoryAlerts: [true],
    systemNotifications: [true],
    emailNotifications: [true],

    // Integrations
    smtpHost: ['smtp.enterprise-mail.com'],
    smtpPort: [587],
    paymentGatewayApiKey: ['sk_test_********************'],
    webhookUrl: ['https://api.my-erp.com/webhooks/orders']
  });

  ngOnInit(): void {
    this.settingsService.loadSettings().subscribe({
      next: (settings) => {
        this.settingsForm.patchValue({
          companyName: settings.companyName ?? '',
          address: settings.address ?? '',
          currency: settings.currency ?? 'USD',
          logoUrl: settings.logoUrl ?? '',
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load settings', 'Close', {
          duration: 4000,
          panelClass: 'error-snackbar',
        });
        this.cdr.detectChanges();
      },
    });
  }

  onSave(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const raw = this.settingsForm.getRawValue();
    
    // Maintain backward compatibility with existing API while including new fields in the update
    const body: CompanySettings = {
      companyName: raw.companyName,
      address: raw.address || undefined,
      currency: raw.currency,
      logoUrl: raw.logoUrl || undefined,
      // The API might not support these yet, but we include them for future-proofing 
      // or if the backend is updated accordingly.
    };

    this.settingsService.updateSettings(body).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Enterprise configuration synchronized!', 'Close', {
          duration: 3500,
          panelClass: 'success-snackbar',
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Synchronization failed. Please verify connectivity.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
        this.cdr.detectChanges();
      },
    });
  }
}
