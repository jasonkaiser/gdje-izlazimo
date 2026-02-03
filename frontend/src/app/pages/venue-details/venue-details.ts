import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Badge } from '../../components/other/badge/badge';
import { InViewDirective } from '../../core/animations/in-view.directive';

import { VenueService } from '../../core/api/venue-service';
import { VenueTableTypeService } from '../../core/api/venue-table-type-service';
import { TableTypeService } from '../../core/api/table-type-service';
import { VenueOperatingHoursService } from '../../core/api/venue-operating-hours-service';

import { VenueResponseDto } from '../../core/models/venues/venue-response.dto';
import { VenueTableTypeResponseDto } from '../../core/models/venue-table-types/venue-table-type-response.dto';
import { TableTypeResponseDto } from '../../core/models/table-types/table-type-response.dto';
import { VenueOperatingHoursResponseDto } from '../../core/models/venue-operating-hours/venue-operating-hours-response.dto';

type TableTypeVm = {
  id: string;
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
  imports: [InViewDirective, Badge, AsyncPipe],
  templateUrl: './venue-details.html',
  styleUrls: ['./venue-details.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenueDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly venueService = inject(VenueService);
  private readonly venueTableTypeService = inject(VenueTableTypeService);
  private readonly tableTypeService = inject(TableTypeService);
  private readonly venueOperatingHoursService = inject(VenueOperatingHoursService);
  private readonly destroyRef = inject(DestroyRef);

  sliderIndex = 0;
  openId: string | null = null;

  titleShown = false;
  sliderShown = false;
  reserveShown = false;
  tablesShown = false;
  whyUsShown = false;
  aboutShown = false;

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
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly vm$ = this.retry$.pipe(
    switchMap(() => this.venueId$),
    switchMap((venueId) => {
      if (!venueId) {
        const vm: Vm = {
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
        };
        return of(vm);
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
            operatingHours: this.fetchOperatingHours(venueId).pipe(
              catchError(() => of(null as VenueOperatingHoursResponseDto | null))
            ),
            tableTypes: this.fetchTableTypesForVenue(venueId).pipe(
              catchError(() => of([] as TableTypeVm[]))
            ),
          }).pipe(
            map(({ operatingHours, tableTypes }) => {
              const vm: Vm = {
                venueId,
                venueName: venue.name ?? '',
                category: venue.venueType ?? '',
                address: venue.addressName ?? '',
                phone: venue.phone ?? '',
                description: venue.description ?? 'Dobrodošli u naš lokal!',
                images: this.getDefaultVenueImages(venue.venueType),
                workingHours: operatingHours
                  ? this.formatWorkingHours(operatingHours)
                  : 'Kontaktirajte za radno vrijeme',
                tableTypes,
                tableTypesLoading: false,
                loading: false,
                errorMsg: '',
              };

              if (!this.openId && tableTypes.length > 0) this.openId = tableTypes[0].id;

              return vm;
            })
          );
        }),
        catchError((err) => {
          console.error(err);
          const vm: Vm = {
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
          };
          return of(vm);
        }),
        switchMap((finalVm) => of(loadingVm, finalVm))
      );
    }),
    takeUntilDestroyed(this.destroyRef),
    shareReplay({ bufferSize: 1, refCount: true })
  );

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

  onTitleInView(v: boolean): void { if (v) this.titleShown = true; }
  onSliderInView(v: boolean): void { if (v) this.sliderShown = true; }
  onReserveInView(v: boolean): void { if (v) this.reserveShown = true; }
  onTablesInView(v: boolean): void { if (v) this.tablesShown = true; }
  onWhyUsInView(v: boolean): void { if (v) this.whyUsShown = true; }
  onAboutInView(v: boolean): void { if (v) this.aboutShown = true; }

  onReserve(venueId: string): void {
    if (!venueId) return;
    this.router.navigate(['/reservations', 'create'], { queryParams: { venueId } });
  }

  private fetchOperatingHours(venueId: string) {
    return this.venueOperatingHoursService.getByVenueId(venueId).pipe(
      catchError(() =>
        this.venueOperatingHoursService.getAllVenueOperatingHours().pipe(
          map((all) => (all ?? []).find((x) => String(x.venueId) === venueId) ?? null)
        )
      )
    );
  }

  private fetchTableTypesForVenue(venueId: string) {
    return forkJoin({
      venueTableTypes: this.venueTableTypeService
        .getAllVenueTableTypes()
        .pipe(catchError(() => of([] as VenueTableTypeResponseDto[]))),
      allTableTypes: this.tableTypeService
        .getAllTableTypes()
        .pipe(catchError(() => of([] as TableTypeResponseDto[]))),
    }).pipe(
      map(({ venueTableTypes, allTableTypes }) => {
        const tableTypeMap = new Map<string, TableTypeResponseDto>(
          allTableTypes.map((tt) => [String(tt.id), tt])
        );

        return venueTableTypes
          .filter((vtt) => String((vtt as any).venueId ?? (vtt as any).venue?.id) === venueId)
          .map((vtt) => {
            const ttId = String((vtt as any).tableTypeId ?? (vtt as any).tableType?.id);
            const tt = tableTypeMap.get(ttId);
            if (!tt) return null;

            const title = tt.name ?? 'Sto';
            return {
              id: String(vtt.id),
              title,
              description: tt.description ?? 'Detalji će biti dostupni uskoro.',
              capacityLabel: this.formatCapacityLabel(title),
            } as TableTypeVm;
          })
          .filter((x): x is TableTypeVm => x !== null);
      })
    );
  }

  private formatWorkingHours(oh: VenueOperatingHoursResponseDto): string {
    const dayMap: Record<string, string> = {
      MONDAY: 'PON',
      TUESDAY: 'UTO',
      WEDNESDAY: 'SRI',
      THURSDAY: 'ČET',
      FRIDAY: 'PET',
      SATURDAY: 'SUB',
      SUNDAY: 'NED',
    };

    const start = dayMap[oh.startDay] ?? oh.startDay;
    const end = dayMap[oh.endDay] ?? oh.endDay;
    const trim = (t: string) => t?.slice(0, 5) ?? '';

    return `${start}–${end}   ${trim(oh.openTime)} – ${trim(oh.closedTime)}`;
  }

  private formatCapacityLabel(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('vip')) return '6–10 Osoba';
    if (n.includes('separe')) return '4–8 Osoba';
    if (n.includes('šank') || n.includes('sank')) return '1–2 Osobe';
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
