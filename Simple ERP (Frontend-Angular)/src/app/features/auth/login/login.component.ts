import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  hidePassword = true;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  isLoading = false;

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  demoAccounts = {
    admin: { email: 'admin@erp.com', password: 'Admin123!' },
    manager: { email: 'manager@erp.com', password: 'Manager123!' },
    employee: { email: 'employee@erp.com', password: 'Employee123!' }
  };

  fillDemoAccount(role: 'admin' | 'manager' | 'employee'): void {
    const account = this.demoAccounts[role];
    this.loginForm.patchValue({
      email: account.email,
      password: account.password
    });
    this.cdr.detectChanges();
    this.snackBar.open(`${role.charAt(0).toUpperCase() + role.slice(1)} credentials filled. Click Sign In to continue.`, 'Dismiss', { duration: 3000 });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    this.isLoading = true;
    this.loginForm.disable();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginForm.enable();
        this.snackBar.open('Welcome back!', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/dashboard']);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loginForm.enable();
        this.cdr.detectChanges();
      },
    });
  }
}
