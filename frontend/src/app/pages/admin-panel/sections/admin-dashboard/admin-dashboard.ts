import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  DestroyRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  DashboardApiService,
  DashboardStats,
  ActivityLog,
  VenueTypeBreakdown,
  ReservationStatusBreakdown,
  TopVenue,
} from '../../../../core/api/dashboard-service';
import { AdminView } from '../../admin-panel';
import { ModalService } from '../../../../core/services/modal';
import { ActivityLogsModalComponent } from '../../../../components/modals/activity-logs-modal/activity-logs-modal';

interface VenueTypeBreakdownUI {
  type: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface ReservationStatusBreakdownUI {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  bgColor: string;
}

type ActivityTheme = {
  badge: string;
  icon: string;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  @Output() navigate = new EventEmitter<AdminView>();

  private readonly dashboardApi  = inject(DashboardApiService);
  private readonly modalService  = inject(ModalService);
  private readonly destroyRef    = inject(DestroyRef);

  stats$!:               Observable<DashboardStats>;
  activities$!:          Observable<ActivityLog[]>;
  allActivities$!:       Observable<ActivityLog[]>;
  venueBreakdown$!:      Observable<VenueTypeBreakdownUI[]>;
  reservationBreakdown$!:Observable<ReservationStatusBreakdownUI[]>;
  topVenues$!:           Observable<TopVenue[]>;

  ngOnInit(): void {
    this.initializeStreams();
  }

  // take(1) — one-shot read, no lingering subscription on every button click
  openActivityLogsModal(): void {
    this.allActivities$.pipe(take(1)).subscribe((activities) => {
      this.modalService.open(ActivityLogsModalComponent, { data: { activities } });
    });
  }

  navigateTo(view: AdminView): void {
    this.navigate.emit(view);
  }

  private initializeStreams(): void {
    this.stats$ = this.dashboardApi.getDashboardStats().pipe(
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.allActivities$ = this.dashboardApi.getTopRecentActivities(100).pipe(
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.activities$ = this.allActivities$.pipe(
      map((activities) => activities.slice(0, 5)),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.venueBreakdown$ = this.dashboardApi.getVenueTypeBreakdown().pipe(
      map((items: VenueTypeBreakdown[]) =>
        items.map((item) => ({
          type:       item.venueType,
          label:      this.getCategoryLabel(item.venueType),
          count:      item.count,
          percentage: this.roundPercent(item.percentage),
          color:      this.getVenueTypeColor(item.venueType),
        }))
      ),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.reservationBreakdown$ = this.dashboardApi.getReservationStatusBreakdown().pipe(
      map((items: ReservationStatusBreakdown[]) =>
        items.map((item) => ({
          status:     item.status,
          label:      this.getStatusLabel(item.status),
          count:      item.count,
          percentage: this.roundPercent(item.percentage),
          color:      this.getStatusColor(item.status),
          bgColor:    this.getStatusBgColor(item.status),
        }))
      ),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.topVenues$ = this.dashboardApi.getTopVenues(5).pipe(
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  roundPercent(value: number): number {
    if (value == null || Number.isNaN(value as any)) return 0;
    return Math.round(value * 10) / 10;
  }

  getTopVenueName(venue: TopVenue): string {
    const anyVenue = venue as any;
    return anyVenue.venueName ?? anyVenue.name ?? anyVenue.venue?.name ?? '—';
  }

  getCategoryLabel(type: string): string {
    const labels: Record<string, string> = {
      CLUB:       'Klub',
      PUB:        'Pub',
      LOUNGE:     'Lounge',
      RESTAURANT: 'Restoran',
    };
    return labels[type] ?? type;
  }

  getVenueTypeColor(type: string): string {
    const colors: Record<string, string> = {
      CLUB:       '#a855f7',
      PUB:        '#3b82f6',
      LOUNGE:     '#10b981',
      RESTAURANT: '#f59e0b',
    };
    return colors[type] ?? '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING:   'Na čekanju',
      ACCEPTED:  'Prihvaćene',
      REJECTED:  'Odbijene',
      CANCELLED: 'Otkazane',
    };
    return labels[status] ?? status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING:   'text-amber-400',
      ACCEPTED:  'text-emerald-400',
      REJECTED:  'text-rose-400',
      CANCELLED: 'text-white/40',
    };
    return colors[status] ?? 'text-white/40';
  }

  getStatusBgColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING:   'bg-amber-500',
      ACCEPTED:  'bg-emerald-500',
      REJECTED:  'bg-rose-500',
      CANCELLED: 'bg-white/20',
    };
    return colors[status] ?? 'bg-white/20';
  }

  getBarWidth(percentage: number): string {
    return `${Math.max(this.roundPercent(percentage), 2)}%`;
  }

  getActivityTime(activity: ActivityLog): string {
    const anyA = activity as any;
    return anyA.createdAt ?? anyA.timestamp ?? anyA.time ?? '';
  }

  getActivityIcon(entityType: string): string {
    const icons: Record<string, string> = {
      USER:        'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      VENUE:       'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      RESERVATION: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      TABLE_TYPE:  'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      SYSTEM:      'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[entityType] ?? icons['SYSTEM'];
  }

  private getActivityTheme(entityType: string): ActivityTheme {
    const themes: Record<string, ActivityTheme> = {
      USER:        { badge: 'bg-blue-500/10 border-blue-500/20',   icon: 'text-blue-400' },
      VENUE:       { badge: 'bg-violet-500/10 border-violet-500/20', icon: 'text-violet-400' },
      RESERVATION: { badge: 'bg-amber-500/10 border-amber-500/20', icon: 'text-amber-400' },
      TABLE_TYPE:  { badge: 'bg-teal-500/10 border-teal-500/20',   icon: 'text-teal-400' },
      SYSTEM:      { badge: 'bg-white/5 border-white/10',           icon: 'text-white/40' },
    };
    return themes[entityType] ?? themes['SYSTEM'];
  }

  getActivityBadgeClass(entityType: string): string {
    return this.getActivityTheme(entityType).badge;
  }

  getActivityIconClass(entityType: string): string {
    return this.getActivityTheme(entityType).icon;
  }

  formatRelativeTime(dateStr: string): string {
    if (!dateStr) return 'Nedavno';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Nedavno';

    const diffMs  = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1)  return 'Upravo sada';
    if (diffMin < 60) return `Prije ${diffMin} min`;

    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Prije ${diffH} h`;

    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Juče';
    if (diffD < 7)  return `Prije ${diffD} dana`;
    if (diffD < 30) return `Prije ${Math.floor(diffD / 7)} sedmica`;

    return date.toLocaleDateString('bs-BA');
  }
}