import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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


type TableTypeVm = {
  id: string;
  tableTypeId: string;
  title: string;
  description: string;
  capacityLabel: string;
};

type Vm = {
  venueId: string;
  venueName: string;
  category: string;
  address: string;
  workingHours: string;
  phone: string;
  description: string;
  images: string[];
  tableTypes: TableTypeVm[];
  tableTypesLoading: boolean;
  loading: boolean;
  errorMsg: string;
};

@Component({
  selector: 'app-venue-details',
  standalone: true,
  imports: [InViewDirective, AsyncPipe, ReservationModal],
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

  sliderIndex = 0;
  openId: string | null = null;

  titleShown = false;
  sliderShown = false;
  reserveShown = false;
  tablesShown = false;
  whyUsShown = false;
  aboutShown = false;

  reservationModalShown = false;
  reservationErrorMsg = '';
  descriptionModalShown = false;
  descriptionText = '';

  isFavorite = false;
  favoriteLoading = false;

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
      this.isFavorite = false;
      this.favoriteLoading = false;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly vm$ = this.retry$.pipe(
    switchMap(() => this.venueId$),
    switchMap((venueId) => {
      if (!venueId) {
        return of<Vm>({
          venueId: '',
          venueName: '',
          category: '',
          address: '',
          workingHours: '',
          phone: '',
          description: '',
          images: [],
          tableTypes: [],
          tableTypesLoading: false,
          loading: false,
          errorMsg: 'Neispravan link (nedostaje ID lokala).',
        });
      }

      const loadingVm: Vm = {
        venueId,
        venueName: '',
        category: '',
        address: '',
        workingHours: '',
        phone: '',
        description: '',
        images: [],
        tableTypes: [],
        tableTypesLoading: true,
        loading: true,
        errorMsg: '',
      };

      return this.venueService.getVenueById(venueId).pipe(
        switchMap((venue) => {
          if (!venue) throw new Error('Venue not found');

          return forkJoin({
            operatingHours: this.venueOperatingHoursService.getByVenueId(venueId).pipe(
              catchError(() => of(null as VenueOperatingHoursResponseDto | null))
            ),
            tableTypes: this.venueTableTypeService.getByVenueId(venueId).pipe(
              catchError(() => of([] as VenueTableTypeResponseDto[]))
            ),
          }).pipe(
            map(({ operatingHours, tableTypes }) => {
              const mappedTableTypes = tableTypes.map((vtt) => ({
                id: vtt.id,
                tableTypeId: vtt.tableTypeId,
                title: vtt.tableTypeName,
                description: vtt.tableTypeDescription ?? 'Detalji će biti dostupni uskoro.',
                capacityLabel: this.formatCapacityLabel(vtt.tableTypeName),
              } satisfies TableTypeVm));

              if (!this.openId && mappedTableTypes.length > 0) {
                this.openId = mappedTableTypes[0].id;
              }

              const sortedImages = [...(venue.images ?? [])].sort((a, b) =>
                a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
              );

              return {
                venueId,
                venueName: venue.name ?? '',
                category: venue.venueType ?? '',
                address: venue.addressName ?? '',
                phone: venue.phone ?? '',
                description: venue.description ?? 'Dobrodošli u naš lokal!',
                images: sortedImages.length
                  ? sortedImages.map((i) => i.imageUrl)
                  : this.getDefaultVenueImages(venue.venueType),
                workingHours: operatingHours
                  ? this.formatWorkingHours(operatingHours)
                  : 'Kontaktirajte za radno vrijeme',
                tableTypes: mappedTableTypes,
                tableTypesLoading: false,
                loading: false,
                errorMsg: '',
              } satisfies Vm;
            }),
            tap((vm) => {
              if (vm.venueId && !vm.errorMsg) {
                this.loadFavoriteState(vm.venueId);
              }
            })
          );
        }),
        catchError((err) => {
          console.error(err);
          return of<Vm>({
            venueId,
            venueName: '',
            category: '',
            address: '',
            workingHours: '',
            phone: '',
            description: '',
            images: [],
            tableTypes: [],
            tableTypesLoading: false,
            loading: false,
            errorMsg: 'Lokal nije pronađen ili je došlo do greške.',
          });
        }),
        switchMap((finalVm) => of(loadingVm, finalVm))
      );
    }),
    takeUntilDestroyed(this.destroyRef),
    shareReplay({ bufferSize: 1, refCount: true })
  );


  private loadFavoriteState(venueId: string): void {
    if (!this.authService.hasRole('user')) return;
    this.favoriteService.getFavorites().subscribe({
      next: (favorites) => {
        this.isFavorite = favorites.some((v) => v.id === venueId);
        this.cdr.markForCheck(); 
      },
      error: () => {},
    });
  }

  toggleFavorite(venueId: string): void {
    if (!this.authService.authenticated()) {
      this.authService.login();
      return;
    }
    if (this.favoriteLoading) return;

    this.favoriteLoading = true;
    this.cdr.markForCheck();

    const action$ = this.isFavorite
      ? this.favoriteService.removeFavorite(venueId)
      : this.favoriteService.addFavorite(venueId);

    action$.subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
        this.favoriteLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.favoriteLoading = false;
        this.cdr.markForCheck();
      },
    });
  }


  retry(): void {
    this.retry$.next();
  }

  prevImage(total: number): void {
    if (!total) return;
    this.sliderIndex = (this.sliderIndex - 1 + total) % total;
  }

  nextImage(total: number): void {
    if (!total) return;
    this.sliderIndex = (this.sliderIndex + 1) % total;
  }

  toggleAccordion(id: string): void {
    this.openId = this.openId === id ? null : id;
  }

  isOpen(id: string): boolean {
    return this.openId === id;
  }

  onTitleInView(v: boolean): void   { if (v) this.titleShown   = true; }
  onSliderInView(v: boolean): void  { if (v) this.sliderShown  = true; }
  onReserveInView(v: boolean): void { if (v) this.reserveShown = true; }
  onTablesInView(v: boolean): void  { if (v) this.tablesShown  = true; }
  onWhyUsInView(v: boolean): void   { if (v) this.whyUsShown   = true; }
  onAboutInView(v: boolean): void   { if (v) this.aboutShown   = true; }

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

  toggleReservation(): void {
    if (!this.authService.authenticated()) {
      this.authService.login();
    } else {
      this.reservationModalShown = !this.reservationModalShown;
    }
  }

  createReservation(payload: CreateReservationRequest): void {
    this.reservationErrorMsg = '';
    this.reservationService.createReservation(payload).subscribe({
      next: () => {
        this.reservationModalShown = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
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
    return `${start}–${end}   ${trim(oh.openTime)} – ${trim(oh.closedTime)}`;
  }

  private formatCapacityLabel(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('vip'))                              return '6–10 Osoba';
    if (n.includes('separe'))                           return '4–8 Osoba';
    if (n.includes('šank') || n.includes('sank'))      return '1–2 Osobe';
    return '2–6 Osoba';
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