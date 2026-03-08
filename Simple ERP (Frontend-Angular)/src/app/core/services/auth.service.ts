import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { ErpApiClient, UserLoginDto, UserRegisterDto } from '../api/erp.api';

export type UserRole = 'Admin' | 'Manager' | 'Employee';

interface DecodedToken {
  sub?: string;
  nameid?: string;
  unique_name?: string;
  email?: string;
  role?: string | string[];
  roles?: string[];
  fullName?: string;
  profilePictureUrl?: string;
  exp?: number;
  [key: string]: unknown;
}

const TOKEN_KEY = 'erp_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ErpApiClient);
  private router = inject(Router);

  login(email: string, password: string): Observable<void> {
    const body: UserLoginDto = { email, password };
    return this.api.login(body).pipe(
      tap((response) => {
        if (response?.token) {
          localStorage.setItem(TOKEN_KEY, response.token);
        }
      }),
      map(() => void 0)
    );
  }

  register(body: UserRegisterDto): Observable<void> {
    return this.api.register(body).pipe(
      tap((response) => {
        if (response?.token) {
          localStorage.setItem(TOKEN_KEY, response.token);
        }
      }),
      map(() => void 0)
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  getUserRole(): UserRole | null {
    const decoded = this.getDecodedToken();
    if (!decoded) return null;

    const roleClaim =
      decoded.role ||
      decoded.roles ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    const roles: string[] = Array.isArray(roleClaim)
      ? roleClaim
      : roleClaim ? [String(roleClaim)] : [];

    const normalized = roles.map(r => r.toLowerCase());

    if (normalized.includes('admin')) return 'Admin';
    if (normalized.includes('manager')) return 'Manager';
    if (normalized.includes('employee')) return 'Employee';

    return null;
  }

  getCurrentUser() {
    const decoded = this.getDecodedToken();
    if (!decoded) return null;
    return {
      id: decoded.nameid || decoded.sub,
      username: decoded.unique_name || decoded.nameid,
      email: decoded.email,
      fullName: decoded.fullName,
      profilePictureUrl: decoded.profilePictureUrl,
      role: this.getUserRole()
    };
  }

  isInRole(allowedRoles: string[]): boolean {
    const role = this.getUserRole();
    if (!role || !allowedRoles?.length) {
      return false;
    }
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    return normalizedAllowed.includes(role.toLowerCase());
  }

  isLoggedIn(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded || !decoded.exp) {
      return !!this.getToken();
    }
    const expiresAtMs = decoded.exp * 1000;
    return Date.now() < expiresAtMs;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
