import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { UserRegisterDto } from '../../../core/api/erp.api';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
})
export class RegisterComponent {
    private fb = inject(NonNullableFormBuilder);
    private router = inject(Router);
    private auth = inject(AuthService);
    private snackBar = inject(MatSnackBar);

    isLoading = false;
    hidePassword = true;

    registerForm = this.fb.group({
        fullName: ['', [Validators.required]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        agreeTerms: [false, [Validators.requiredTrue]],
    });

    get fullName() { return this.registerForm.get('fullName'); }
    get username() { return this.registerForm.get('username'); }
    get email() { return this.registerForm.get('email'); }
    get password() { return this.registerForm.get('password'); }
    get agreeTerms() { return this.registerForm.get('agreeTerms'); }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.registerForm.disable();

        const formValues = this.registerForm.getRawValue();
        const dto: UserRegisterDto = {
            fullName: formValues.fullName,
            username: formValues.username,
            email: formValues.email,
            password: formValues.password,
        };

        this.auth.register(dto).subscribe({
            next: () => {
                this.isLoading = false;
                this.snackBar.open('Registration successful!', 'Dismiss', { duration: 3000, panelClass: 'success-snackbar' });
                this.router.navigate(['/login']);
            },
            error: () => {
                this.isLoading = false;
                this.registerForm.enable();
                this.snackBar.open('Registration failed. Username or email may already exist.', 'Close', {
                    duration: 5000,
                    panelClass: 'error-snackbar',
                });
            },
        });
    }
}
