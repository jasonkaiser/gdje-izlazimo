import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  DestroyRef,
  signal,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  map,
  catchError,
  shareReplay,
  take
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserResponseDto } from '../../core/models/users/user-response.dto';
import { AuthApiService } from '../../core/api/auth-api-service';
import { UserService } from '../../core/api/user-service';
import { VenueService } from '../../core/api/venue-service';
import { ReservationService } from '../../core/api/reservation-service';

import { AdminDashboardComponent } from './sections/admin-dashboard/admin-dashboard';
import { AdminUsersComponent } from './sections/admin-users/admin-users';
import { AdminVenuesComponent } from './sections/admin-venues/admin-venues';
import { AdminReservationsComponent } from './sections/admin-reservations/admin-reservations';
import { AdminTableTypesComponent } from './sections/admin-table-types/admin-table-types';
import { AdminSettingsComponent } from './sections/admin-settings/admin-settings';

export type AdminView = 'dashboard' | 'users' | 'venues' | 'reservations' | 'table-types' | 'settings';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminVenuesComponent,
    AdminReservationsComponent,
    AdminTableTypesComponent,
    AdminSettingsComponent
  ],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanelComponent implements OnInit {
  
  private readonly authService = inject(AuthApiService);
  private readonly userService = inject(UserService);
  private readonly venueService = inject(VenueService);
  private readonly reservationService = inject(ReservationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  activeView = signal<AdminView>('dashboard');
  sidebarOpen = false; 

  currentUser$!: Observable<UserResponseDto>;
  userCount$!: Observable<number>;
  venueCount$!: Observable<number>;
  reservationCount$!: Observable<number>;

  ngOnInit(): void {
    this.initializeStreams();
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private initializeStreams(): void {
    
    this.currentUser$ = this.authService.me().pipe(
      catchError(err => {
        console.error('[AdminPanel] Failed to load current user:', err);
        this.router.navigate(['/login']);
        return of({} as UserResponseDto);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.userCount$ = this.userService.getUsers({ pageSize: 1000 }).pipe(
      map(users => users.length),
      catchError(() => of(0)),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.venueCount$ = this.venueService.getVenues({ pageSize: 1000 }).pipe(
      map(venues => venues.length),
      catchError(() => of(0)),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.reservationCount$ = this.reservationService.getAllReservations({ pageSize: 1000 }).pipe(
      map(reservations => reservations.length),
      catchError(() => of(0)),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.sidebarOpen = window.innerWidth >= 1024;
    }
  }
  
  getUserInitial(user: UserResponseDto | null): string {
    return user?.name?.charAt(0).toUpperCase() || 'A';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveView(view: AdminView): void {
    this.activeView.set(view);
    
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  getViewTitle(): string {
    const titles: Record<AdminView, string> = {
      dashboard: 'Dashboard',
      users: 'Korisnici',
      venues: 'Lokali',
      reservations: 'Rezervacije',
      'table-types': 'Tipovi Stolova',
      settings: 'Postavke'
    };
    return titles[this.activeView()];
  }

  logout(): void {


    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
    
    this.router.navigate(['/login']);
  }
}