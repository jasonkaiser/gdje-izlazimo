import {
  Component,
  OnInit,
  inject,
  DestroyRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, switchMap, forkJoin, of, tap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { AuthApiService } from '../../core/api/auth-api-service';
import { UserService } from '../../core/api/user-service';
import { ReservationService } from '../../core/api/reservation-service';
import { UserFavoriteVenueService } from '../../core/api/user-favorite-venue';
import { UserResponseDto } from '../../core/models/users/user-response.dto';
import { UpdateUserRequest } from '../../core/models/users/update-user.request';
import { ReservationResponseDto } from '../../core/models/reservations/reservation-response.dto';
import { ReservationStatus } from '../../core/models/reservations/reservation-status.enum';
import { Role } from '../../core/models/users/user-role.enum';

type EditState = { name: string; phone: string };
type SaveState = 'idle' | 'saving' | 'success' | 'error';

interface ReservationStats {
  total: number;
  upcoming: number;
  past: number;
  cancelled: number;
  pending: number;
  accepted: number;
}

interface VenueTypeStat {
  type: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  bgColor: string;
}

export interface FavoriteVenueVm {
  id: string;
  name: string;
  venueType: string;
  address: string;
  imageUrl: string;
  typeLabel: string;
  typeColor: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly authService    = inject(AuthService);
  private readonly authApiService = inject(AuthApiService);
  private readonly userService    = inject(UserService);
  private readonly reservationService = inject(ReservationService);
  private readonly favoriteService    = inject(UserFavoriteVenueService);
  private readonly router         = inject(Router);
  private readonly destroyRef     = inject(DestroyRef);

  user         = signal<UserResponseDto | null>(null);
  reservations = signal<ReservationResponseDto[]>([]);
  favorites    = signal<FavoriteVenueVm[]>([]);
  loading      = signal(true);
  errorMsg     = signal('');

  editing   = signal(false);
  editState = signal<EditState>({ name: '', phone: '' });
  saveState = signal<SaveState>('idle');
  saveError = signal('');

  removingFavoriteId = signal<string | null>(null);

  readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    if (role === Role.VENUE_OWNER) return 'Vlasnik lokala';
    if (role === Role.ADMIN)       return 'Administrator';
    return 'Korisnik';
  });

  readonly roleColor = computed(() => {
    const role = this.user()?.role;
    if (role === Role.VENUE_OWNER) return 'violet';
    if (role === Role.ADMIN)       return 'amber';
    return 'sky';
  });

  readonly initials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
  });

  readonly memberSince = computed(() => {
    const raw = this.user()?.createdAt;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('bs-BA', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  });

  readonly reservationStats = computed((): ReservationStats => {
    const list = this.reservations();
    const now  = new Date();
    const toDateTime = (r: ReservationResponseDto) => {
      const time = (r.reservationTime ?? '00:00').slice(0, 5);
      return new Date(`${r.reservationDate}T${time}:00`);
    };
    return {
      total:     list.length,
      upcoming:  list.filter(r => r.status !== ReservationStatus.CANCELLED && toDateTime(r) >= now).length,
      past:      list.filter(r => r.status !== ReservationStatus.CANCELLED && toDateTime(r) <  now).length,
      cancelled: list.filter(r => r.status === ReservationStatus.CANCELLED).length,
      pending:   list.filter(r => r.status === ReservationStatus.PENDING).length,
      accepted:  list.filter(r => r.status === ReservationStatus.ACCEPTED).length,
    };
  });

  readonly venueTypeStats = computed((): VenueTypeStat[] => {
    const list = this.reservations();
    if (!list.length) return [];
    const counts = new Map<string, number>();
    for (const r of list) {
      const type = (r as any).venueType ?? (r as any).venue?.venueType ?? 'UNKNOWN';
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    const colorMap: Record<string, { color: string; bgColor: string; label: string }> = {
      CLUB:       { color: 'text-purple-400',  bgColor: 'bg-purple-500',  label: 'Klub'     },
      PUB:        { color: 'text-blue-400',    bgColor: 'bg-blue-500',    label: 'Pub'      },
      LOUNGE:     { color: 'text-emerald-400', bgColor: 'bg-emerald-500', label: 'Lounge'   },
      RESTAURANT: { color: 'text-amber-400',   bgColor: 'bg-amber-500',   label: 'Restoran' },
      UNKNOWN:    { color: 'text-white/40',    bgColor: 'bg-white/20',    label: 'Ostalo'   },
    };
    return Array.from(counts.entries())
      .map(([type, count]) => ({
        type,
        label:      colorMap[type]?.label   ?? type,
        count,
        percentage: Math.round((count / list.length) * 1000) / 10,
        color:      colorMap[type]?.color   ?? 'text-white/40',
        bgColor:    colorMap[type]?.bgColor ?? 'bg-white/20',
      }))
      .sort((a, b) => b.count - a.count);
  });

  readonly recentReservations = computed(() =>
    this.reservations()
      .slice()
      .sort((a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime())
      .slice(0, 5)
  );

  ngOnInit(): void {
    this.authApiService.me().pipe(
      tap(user => this.user.set(user)),
      switchMap(user =>
        forkJoin({
          reservations: this.reservationService.getReservationsByUser(user.id, {
            pageSize: 1000, sortBy: 'reservationDate', sortDir: 'DESC',
          }).pipe(catchError(() => of([]))),
          favorites: this.favoriteService.getFavorites().pipe(catchError(() => of([]))),
        })
      ),
      tap(({ reservations, favorites }) => {
        this.reservations.set(reservations);

        const typeLabel: Record<string, string> = {
          CLUB: 'Klub', PUB: 'Pub', LOUNGE: 'Lounge', RESTAURANT: 'Restoran',
        };
        const typeColor: Record<string, string> = {
          CLUB: 'text-purple-400', PUB: 'text-blue-400',
          LOUNGE: 'text-emerald-400', RESTAURANT: 'text-amber-400',
        };
        const defaultImages: Record<string, string> = {
          CLUB:       'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
          PUB:        'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
          RESTAURANT: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          LOUNGE:     'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
        };

        this.favorites.set(
          favorites.map((v: any) => {
            const vType = v.venueType ?? 'UNKNOWN';
            const primaryImage = v.images?.find((i: any) => i.isPrimary)?.imageUrl
              ?? v.images?.[0]?.imageUrl
              ?? defaultImages[vType]
              ?? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80';
            return {
              id:        v.id,
              name:      v.name ?? '',
              venueType: vType,
              address:   v.addressName ?? '',
              imageUrl:  primaryImage,
              typeLabel: typeLabel[vType] ?? vType,
              typeColor: typeColor[vType] ?? 'text-white/40',
            } satisfies FavoriteVenueVm;
          })
        );
        this.loading.set(false);
      }),
      catchError(err => {
        console.error(err);
        this.errorMsg.set('Greška pri učitavanju profila.');
        this.loading.set(false);
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  removeFavorite(venueId: string, event: Event): void {
    event.stopPropagation();
    if (this.removingFavoriteId()) return;
    this.removingFavoriteId.set(venueId);
    this.favoriteService.removeFavorite(venueId).subscribe({
      next: () => {
        this.favorites.update(list => list.filter(v => v.id !== venueId));
        this.removingFavoriteId.set(null);
      },
      error: () => this.removingFavoriteId.set(null),
    });
  }

  navigateToVenue(venueId: string): void {
    this.router.navigate(['/venues', venueId]);
  }

  startEdit(): void {
    const u = this.user();
    if (!u) return;
    this.editState.set({ name: u.name ?? '', phone: u.phone ?? '' });
    this.saveState.set('idle');
    this.saveError.set('');
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.saveState.set('idle');
    this.saveError.set('');
  }

  saveEdit(): void {
    const u = this.user();
    if (!u) return;
    const { name, phone } = this.editState();
    if (!name.trim()) { this.saveError.set('Ime ne može biti prazno.'); return; }

    this.saveState.set('saving');
    this.saveError.set('');

    const request: UpdateUserRequest = { name: name.trim(), phone: phone.trim(), role: u.role };

    this.userService.updateUser(request, u.id).pipe(
      tap(updated => {
        this.user.set(updated);
        this.saveState.set('success');
        setTimeout(() => { this.editing.set(false); this.saveState.set('idle'); }, 1200);
      }),
      catchError(err => {
        console.error(err);
        this.saveError.set('Greška pri čuvanju. Pokušaj ponovo.');
        this.saveState.set('error');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  updateEditName(value: string): void  { this.editState.update(s => ({ ...s, name: value })); }
  updateEditPhone(value: string): void { this.editState.update(s => ({ ...s, phone: value })); }
  logout(): void { this.authService.logout(); }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Na čekanju', ACCEPTED: 'Prihvaćena',
      REJECTED: 'Odbijena',  CANCELLED: 'Otkazana',
    };
    return map[status] ?? status;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'text-amber-400',
      ACCEPTED:  'text-emerald-400',
      REJECTED:  'text-rose-400',
      CANCELLED: 'text-white/35',
    };
    return map[status] ?? 'text-white/35';
  }

  getStatusBadgeBg(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'border-amber-500/25 bg-amber-500/[0.08]',
      ACCEPTED:  'border-emerald-500/25 bg-emerald-500/[0.08]',
      REJECTED:  'border-rose-500/25 bg-rose-500/[0.08]',
      CANCELLED: 'border-white/10 bg-white/[0.03]',
    };
    return map[status] ?? 'border-white/10 bg-white/[0.03]';
  }

  getBarWidth(pct: number): string {
    return `${Math.max(pct, 2)}%`;
  }
}