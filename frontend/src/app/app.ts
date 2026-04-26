import { Component, OnInit, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';
import { AuthNavbar } from './core/layout/auth-navbar/auth-navbar';
import { PublicNavbar } from './core/layout/public-navbar/public-navbar';
import { ToastHost } from './core/ui/toast-host/toast-host';
import { LoadingBar } from './components/other/loading-bar/loading-bar';
import { AppFooterComponent } from './core/layout/footer/footer';
import { InstallBannerComponent } from './core/pwa/install-banner/install-baner';

declare var gtag: Function;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AuthNavbar,
    PublicNavbar,
    ToastHost,
    LoadingBar,
    AppFooterComponent,
    InstallBannerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  loading = false;

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    )
  );

  readonly isAdminRoute = computed(() =>
    (this.currentUrl() ?? '').includes('/admin')
  );

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (typeof gtag === 'function') {
          gtag('config', 'G-J8RREHX1TP', {
            page_path: event.urlAfterRedirects,
          });
        }
      });
  }

  ngOnInit() {}
}