import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-disabled',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="disabled-container">
      <div class="glass-card">
        <mat-icon class="error-icon">lock_person</mat-icon>
        <h1>Account Restricted</h1>
        <p>Your access to Simple ERP has been suspended by an administrator.</p>
        <div class="meta">
          <span>Please contact your system manager for assistance.</span>
        </div>
        <button mat-flat-button color="primary" routerLink="/login">
          <mat-icon>logout</mat-icon>
          Return to Login
        </button>
      </div>
    </div>
  `,
  styles: [`
    .disabled-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      font-family: 'Inter', sans-serif;
    }
    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 3rem;
      border-radius: 24px;
      text-align: center;
      max-width: 450px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #fb7185;
      margin-bottom: 1.5rem;
    }
    h1 {
      color: #fff;
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 1rem;
    }
    p {
      color: #94a3b8;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .meta {
      margin-bottom: 2rem;
      color: #64748b;
      font-size: 0.9rem;
      font-style: italic;
    }
    button {
      border-radius: 12px;
      padding: 0 2rem;
      height: 48px;
    }
  `]
})
export class AccountDisabledComponent {}
