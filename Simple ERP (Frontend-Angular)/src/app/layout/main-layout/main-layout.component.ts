import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatNavList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { Observable, Subscription, of } from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/core';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { CompanySettings } from '../../core/api/erp.api';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatButton,
    MatIconButton,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatIcon,
    MatProgressBar,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;

  public isLoading$: Observable<boolean>;
  public company$: Observable<CompanySettings | null>;
  public isHandset$: Observable<boolean>;
  public isHandset = false;
  private sub?: Subscription;

  constructor(
    private auth: AuthService,
    private settingsService: SettingsService,
    private loadingService: LoadingService,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = this.loadingService.loading$;
    this.company$ = this.settingsService.settings$.pipe(
      catchError(() => of(null))
    );
    this.isHandset$ = this.breakpointObserver
      .observe(['(max-width: 991.98px)'])
      .pipe(
        map((result) => result.matches),
        shareReplay(1)
      );
  }

  get user() {
    return this.auth.getCurrentUser();
  }

  public get userRole(): string {
    return this.auth.getUserRole() || 'User';
  }

  public get userEmail(): string {
    const token = this.auth.getDecodedToken();
    return (token?.['email'] as string) || (token?.unique_name as string) || 'user@erp.com';
  }

  public get isAdmin(): boolean {
    return this.auth.getUserRole() === 'Admin';
  }

  public get isManager(): boolean {
    return this.auth.getUserRole() === 'Manager';
  }

  ngOnInit(): void {
    this.sub = this.isHandset$.subscribe((v) => {
      this.isHandset = v;
      this.cdr.detectChanges();
    });
    if (this.isAdmin || this.isManager) {
      this.settingsService.loadSettings().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  public logout(): void {
    this.auth.logout();
  }

  public closeDrawerIfHandset(): void {
    if (this.isHandset && this.drawer) {
      this.drawer.close();
    }
  }
}
