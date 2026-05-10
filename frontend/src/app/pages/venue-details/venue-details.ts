import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';
import { InViewDirective } from '../../core/animations/in-view.directive';
import { VenueService } from '../../core/api/venue-service';
import { VenueTableTypeService } from '../../core/api/venue-table-type-service';
import { VenueOperatingHoursService } from '../../core/api/venue-operating-hours-service';
import { VenueOperatingHoursResponseDto } from '../../core/models/venue-operating-hours/venue-operating-hours-response.dto';
import { VenueTableTypeResponseDto } from '../../core/models/venue-table-types/venue-table-type-response.dto';
import { ReservationModal } from '../../components/modals/reservation-modal/reservation-modal';
import { AuthService } from '../../core/auth/auth.service';
import { CreateReservationRequest } from '../../core/models/reservations/create-reservation.request';
import { ReservationService } from '../../core/api/reservation-service';
import { UserFavoriteVenueService } from '../../core/api/user-favorite-venue';
import { ReservationSuccessModal } from '../../components/modals/reservation-success-modal/reservation-success-modal';
import { RatingService } from '../../core/api/rating-service';
import { RatingResponseDto } from '../../core/models/ratings/rating-response.dto';
import { VenueRatingStatsDto } from '../../core/models/ratings/venue-rating-response.dto';
import { VenueMapComponent } from '../../components/other/venue-map/venue-map';
import { FormsModule } from '@angular/forms';
import { RatingModal } from '../../components/modals/rating-modal/rating-modal';
import { EventService } from '../../core/api/event-service';
import { EventResponseDto } from '../../core/models/events/event-response.dto';
import { EventCard } from '../../components/cards/event-card/event-card';
import { Router } from '@angular/router';
import { VenueImageService } from '../../core/api/venue-image-service';
import { VenueImageResponseDto } from '../../core/models/venue-images/venue-image-response';


type TableTypeVm = {
  id: string;
  tableTypeId: string;
  title: string;
  description: string;
  capacityLabel: string;
};

type EventVm = {
  id: string;
  title: string;
  venueName: string;
  venueAddress: string;
  locationName: string;
  locationAddress: string;
  venueId: string | null;
  eventType: string | null;
  imageUrl: string;
  eventDateTime: string;
  viewCount: number;
  trending: boolean;
  featured: boolean;
};

type Vm = {
  venueId: string;
  venueName: string;
  category: string;
  address: string;
  workingHours: string;
  phone: string;
  instagram: string;
  description: string;
  images: string[];
  tableTypes: TableTypeVm[];
  tableTypesLoading: boolean;
  totalCapacity: number;
  loading: boolean;
  errorMsg: string;
  isFavorite: boolean;
  averageRating: number;
  totalRatings: number;
  ratings: RatingVm[];
  ratingsLoading: boolean;
  latitude: number;
  longitude: number;
  isPartner: boolean;
  events: EventVm[];
  eventsLoading: boolean;
};

type RatingVm = {
  id: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  profileImageUrl: string | null;
};

const EMPTY_VM: Omit<Vm, 'venueId' | 'loading' | 'errorMsg'> = {
  venueName: '',
  category: '',
  address: '',
  workingHours: '',
  phone: '',
  instagram: '',
  description: '',
  images: [],
  tableTypes: [],
  tableTypesLoading: false,
  totalCapacity: 0,
  isFavorite: false,
  averageRating: 0,
  totalRatings: 0,
  ratings: [],
  ratingsLoading: false,
  latitude: 0,
  longitude: 0,
  isPartner: false,
  events: [],
  eventsLoading: false,
};

@Component({
  selector: 'app-venue-details',
  standalone: true,
  imports: [InViewDirective, AsyncPipe, ReservationModal, ReservationSuccessModal, DecimalPipe, DatePipe, VenueMapComponent, FormsModule, RatingModal, EventCard],
  templateUrl: './venue-details.html',
  styleUrls: ['./venue-details.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenueDetails {

  private readonly route = inject(ActivatedRoute);
  private readonly venueService = inject(VenueService);
  private readonly venueTableTypeService = inject(VenueTableTypeService);
  private readonly venueOperatingHoursService = inject(VenueOperatingHoursService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly authService = inject(AuthService);
  private readonly reservationService = inject(ReservationService);
  private readonly favoriteService = inject(UserFavoriteVenueService);
  private readonly ratingService = inject(RatingService);
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly venueImageService = inject(VenueImageService);

  private lastVm: Vm | null = null;
  private touchStartX = 0;
  private touchStartY = 0;

  sliderIndex = 0;
  openId: string | null = null;

  titleShown = false;
  sliderShown = false;
  reserveShown = false;
  tablesShown = false;
  whyUsShown = false;
  aboutShown = false;
  eventsShown = false;

  reservationModalShown = false;
  reservationErrorMsg = '';
  descriptionModalShown = false;
  descriptionText = '';

  favoriteLoading = false;

  successModalShown = false;
  successDetails: { tableType: string; date: string; time: string; guests: number } = {
    tableType: '', date: '', time: '', guests: 0
  };

  ratingModalShown = false;
  ratingSubmitting = false;
  alreadyRated = false;

  private readonly retry$ = new BehaviorSubject<void>(undefined);

  private readonly venueId$ = this.route.paramMap.pipe(
    map((p) => p.get('id') ?? ''),
    tap(() => {
      this.sliderIndex = 0;
      this.openId = null;
      this.titleShown = false;
      this.sliderShown = false;
      this.reserveShown = false;
      this.tablesShown = false;
      this.whyUsShown = false;
      this.aboutShown = false;
      this.eventsShown = false;
      this.favoriteLoading = false;
      this.ratingModalShown = false;
      this.alreadyRated = false;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly vm$ = this.retry$.pipe(
    switchMap(() => this.venueId$),
    switchMap((venueId) => {
      if (!venueId) {
        return of<Vm>({
          ...EMPTY_VM,
          venueId: '',
          loading: false,
          errorMsg: 'Neispravan link (nedostaje ID lokala).',
        });
      }

      const loadingVm: Vm = {
        ...EMPTY_VM,
        venueId,
        tableTypesLoading: true,
        loading: true,
        errorMsg: '',
      };

      return this.venueService.getVenueById(venueId).pipe(
        switchMap((venue) => {
          if (!venue) throw new Error('Venue not found');

          const favorites$ = this.authService.hasRole('user')
            ? this.favoriteService.getFavorites().pipe(catchError(() => of([])))
            : of([]);

          const userId = this.authService.getUserId?.();
          const hasRated$ = (this.authService.authenticated() && userId)
            ? this.ratingService.hasRated(venueId, userId).pipe(catchError(() => of(false)))
            : of(false);

          return forkJoin({
            operatingHours: this.venueOperatingHoursService.getByVenueId(venueId).pipe(
              catchError(() => of(null as VenueOperatingHoursResponseDto | null))
            ),
            tableTypes: this.venueTableTypeService.getByVenueId(venueId).pipe(
              catchError(() => of([] as VenueTableTypeResponseDto[]))
            ),
            ratings: this.ratingService.getByVenueId(venueId).pipe(
              catchError(() => of([] as RatingResponseDto[]))
            ),
            stats: this.ratingService.getVenueStats(venueId).pipe(
              catchError(() => of({ averageRating: 0, totalRatings: 0 } as VenueRatingStatsDto))
            ),
            favorites: favorites$,
            hasRated: hasRated$,
            events: this.eventService.getEventsByVenue(venueId, { pageSize: 6, sortDir: 'ASC' }).pipe(
              catchError(() => of([] as EventResponseDto[]))
            ),
            images: this.venueImageService.getByVenueId(venueId).pipe(
              catchError(() => of([] as VenueImageResponseDto[]))
            ),
          }).pipe(
            map(({ operatingHours, tableTypes, favorites, stats, ratings, hasRated, events, images }) => {
              this.alreadyRated = hasRated;

              const mappedTableTypes = tableTypes.map((vtt) => ({
                id: vtt.id,
                tableTypeId: vtt.tableTypeId,
                title: vtt.tableTypeName,
                description: vtt.tableTypeDescription ?? 'Detalji će biti dostupni uskoro.',
                capacityLabel: `${vtt.minCapacity}–${vtt.maxCapacity} Osoba`,
              } satisfies TableTypeVm));

              const mappedRatings: RatingVm[] = ratings
                .slice(0, 3)
                .map(r => ({
                  id:              r.id,
                  userName:        r.userName,
                  rating:          r.rating,
                  comment:         r.comment,
                  createdAt:       r.createdAt,
                  profileImageUrl: r.profileImageUrl ?? null,
                }));

              const mappedEvents: EventVm[] = events.map(e => ({
                  id:              e.id,
                  title:           e.name,
                  venueName:       e.venueName ?? '',
                  venueAddress:    e.venueAddress ?? '',
                  locationName:    e.locationName ?? '',
                  locationAddress: e.locationAddress ?? '',
                  venueId:         e.venueId ?? null,
                  eventType:       e.eventType ?? null,
                  imageUrl:        e.imageUrl ?? '',
                  eventDateTime:   e.eventDateTime,
                  viewCount:       e.viewCount,
                  trending:        e.trending,
                  featured:        e.featured ?? false,
              }));

              if (!this.openId && mappedTableTypes.length > 0) {
                this.openId = mappedTableTypes[0].id;
              }

              const sortedImages = [...images].sort((a, b) =>
                a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
              );

              const totalCapacity = tableTypes.reduce(
                (sum, vtt) => sum + vtt.quantity * vtt.maxCapacity, 0
              );

              return {
                venueId,
                venueName: venue.name ?? '',
                category: venue.venueType ?? '',
                address: venue.addressName ?? '',
                phone: (venue.phone && venue.phone !== '0') ? venue.phone : '',
                instagram: venue.instagram ?? '',
                description: venue.description ?? 'Dobrodošli u naš lokal!',
                images: sortedImages.length
                  ? sortedImages.map((i) => i.imageUrl)
                  : this.getDefaultVenueImages(venue.venueType),
                workingHours: operatingHours
                  ? this.formatWorkingHours(operatingHours)
                  : 'Kontaktirajte za radno vrijeme',
                tableTypes: mappedTableTypes,
                tableTypesLoading: false,
                totalCapacity,
                loading: false,
                errorMsg: '',
                averageRating:  stats.averageRating,
                totalRatings:   stats.totalRatings,
                ratings:        mappedRatings,
                ratingsLoading: false,
                latitude: venue.latitude ?? 0,
                longitude: venue.longitude ?? 0,
                isFavorite: (favorites as Array<{ id: string }>).some((v) => v.id === venueId),
                isPartner: venue.venueKind === 'PARTNER',
                events: mappedEvents,
                eventsLoading: false,
              } satisfies Vm;
            })
          );
        }),
        catchError(() => {
          return of<Vm>({
            ...EMPTY_VM,
            venueId,
            loading: false,
            errorMsg: 'Lokal nije pronađen ili je došlo do greške.',
          });
        }),
        startWith(loadingVm)
      );
    }),
    tap(vm => { if (!vm.loading) this.lastVm = vm; }),
    takeUntilDestroyed(this.destroyRef),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  navigateToEvent(id: string): void {
    this.router.navigate(['/events', id]);
  }

  submitRating(payload: { rating: number; comment: string }): void {
    const vm = this.lastVm;
    if (!vm) return;

    this.ratingSubmitting = true;
    this.cdr.markForCheck();

    const userId = this.authService.getUserId?.();

    this.ratingService.createRating({
      venueId: vm.venueId,
      userId,
      rating: payload.rating,
      comment: payload.comment || undefined,
    }).subscribe({
      next: () => {
        this.ratingSubmitting = false;
        this.ratingModalShown = false;
        this.alreadyRated = true;
        this.retry$.next();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.ratingSubmitting = false;
        if (err.status === 409) {
          this.alreadyRated = true;
          this.ratingModalShown = false;
        }
        this.cdr.markForCheck();
      }
    });
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent, imageCount: number): void {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? this.nextImage(imageCount) : this.prevImage(imageCount);
    }
  }

  toggleFavorite(vm: Vm): void {
    if (!this.authService.authenticated()) {
      this.authService.login();
      return;
    }
    if (this.favoriteLoading) return;

    this.favoriteLoading = true;
    this.cdr.markForCheck();

    const action$ = vm.isFavorite
      ? this.favoriteService.removeFavorite(vm.venueId)
      : this.favoriteService.addFavorite(vm.venueId);

    action$.subscribe({
      next: () => {
        vm.isFavorite = !vm.isFavorite;
        this.favoriteLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.favoriteLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  retry(): void { this.retry$.next(); }

  prevImage(total: number): void {
    if (!total) return;
    this.sliderIndex = (this.sliderIndex - 1 + total) % total;
  }

  nextImage(total: number): void {
    if (!total) return;
    this.sliderIndex = (this.sliderIndex + 1) % total;
  }

  toggleAccordion(id: string): void { this.openId = this.openId === id ? null : id; }
  isOpen(id: string): boolean { return this.openId === id; }

  onTitleInView(v: boolean): void   { if (v) this.titleShown   = true; }
  onSliderInView(v: boolean): void  { if (v) this.sliderShown  = true; }
  onReserveInView(v: boolean): void { if (v) this.reserveShown = true; }
  onTablesInView(v: boolean): void  { if (v) this.tablesShown  = true; }
  onWhyUsInView(v: boolean): void   { if (v) this.whyUsShown   = true; }
  onAboutInView(v: boolean): void   { if (v) this.aboutShown   = true; }
  onEventsInView(v: boolean): void  { if (v) this.eventsShown  = true; }

  shortText(text: string, maxChars = 180): string {
    const t = (text ?? '').trim().replace(/\s+/g, ' ');
    if (!t) return '';
    if (t.length <= maxChars) return t;
    const cut = t.slice(0, maxChars);
    const lastSpace = cut.lastIndexOf(' ');
    const safe = lastSpace > 80 ? cut.slice(0, lastSpace) : cut;
    return `${safe} ...`;
  }

  openDescriptionModal(text: string): void {
    this.descriptionText = text;
    this.descriptionModalShown = true;
  }

  openRatingModal(): void {
    if (!this.authService.authenticated()) {
      this.authService.login();
      return;
    }
    this.ratingModalShown = true;
    this.cdr.markForCheck();
  }

  toggleReservation(vm?: Vm): void {
    const v = vm ?? this.lastVm;
    if (!v?.isPartner) return;
    if (!this.authService.authenticated()) {
      this.authService.login();
    } else {
      this.reservationModalShown = !this.reservationModalShown;
    }
  }

  scrollToReviews(): void {
    const el = document.getElementById('venue-reviews');
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  createReservation(payload: CreateReservationRequest): void {
    this.reservationErrorMsg = '';
    this.reservationService.createReservation(payload).subscribe({
      next: () => {
        this.reservationModalShown = false;
        this.vm$.pipe(take(1)).subscribe(vm => {
          const found = vm.tableTypes.find(t => t.tableTypeId === payload.tableTypeId);
          this.successDetails = {
            tableType: found?.title ?? payload.tableTypeId,
            date: payload.reservationDate ?? '',
            time: payload.reservationTime ?? '',
            guests: payload.numberOfPeople ?? 0,
          };
          this.successModalShown = true;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        if (err.status === 409) {
          this.reservationErrorMsg = 'Već imaš rezervaciju za ovaj lokal danas.';
        } else if (err.status === 400) {
          this.reservationErrorMsg = err.error?.message ?? 'Neispravan zahtjev.';
        } else {
          this.reservationErrorMsg = 'Došlo je do greške. Pokušaj ponovo.';
        }
        this.cdr.markForCheck();
      },
    });
  }

  private formatWorkingHours(oh: VenueOperatingHoursResponseDto): string {
    const dayMap: Record<string, string> = {
      MONDAY: 'PON', TUESDAY: 'UTO', WEDNESDAY: 'SRI',
      THURSDAY: 'ČET', FRIDAY: 'PET', SATURDAY: 'SUB', SUNDAY: 'NED',
    };
    const start = dayMap[oh.startDay] ?? oh.startDay;
    const end   = dayMap[oh.endDay]   ?? oh.endDay;
    const trim  = (t: string) => t?.slice(0, 5) ?? '';

    const openNormalized  = trim(oh.openTime);
    const closeNormalized = trim(oh.closedTime);

    if (openNormalized === '00:00' && closeNormalized === '12:00') {
      return `${start}–${end}   24H OTVORENO`;
    }

    return `${start}–${end}   ${openNormalized} – ${closeNormalized}`;
  }

  private getDefaultVenueImages(type: string): string[] {
    const map: Record<string, string[]> = {
      CLUB: [
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
        'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=2000&q=80',
      ],
      PUB: [
        'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
        'https://images.unsplash.com/photo-1436076863939-06870fe779c2',
        'https://images.unsplash.com/photo-1572116469696-31de0f17cc34',
      ],
      RESTAURANT: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
      ],
      LOUNGE: [
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
        'https://images.unsplash.com/photo-1571624436279-b272aff752b5',
        'https://images.unsplash.com/photo-1582037928769-181f2644ecb7',
      ],
    };
    return map[type] ?? ['https://images.unsplash.com/photo-1514933651103-005eec06c04b'];
  }
}