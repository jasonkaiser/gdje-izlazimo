import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, computed, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventSearchBarComponent } from '../../components/other/event-search-bar/event-search-bar';
import { EventCard } from '../../components/cards/event-card/event-card';
import { EventService } from '../../core/api/event-service';
import { EventResponseDto } from '../../core/models/events/event-response.dto';
import { DateFilterChange, EventDateFilterComponent } from '../../components/other/event-date-filter/event-date-filter';


type SortValue = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc';

type EventCardVm = {
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
  featured?: boolean;
};

type ViewModel = {
  items: EventCardVm[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
};

type Params = {
  query: string;
  dateFrom: string | null;  
  dateTo: string | null;   
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  pageNo: number;
  pageSize: number;
};

@Component({
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.html',
  imports: [EventSearchBarComponent, EventCard, AsyncPipe, EventDateFilterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsComponent {
  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly destroyRef   = inject(DestroyRef);

  readonly skeleton = Array.from({ length: 8 }, (_, i) => i);
  private readonly pageCache    = new Map<number, EventCardVm[]>();
  private readonly hasMoreCache = new Map<number, boolean>();
  private readonly allKnownEventDates = signal<Set<string>>(new Set());
  readonly eventDates = computed<string[]>(() => [...this.allKnownEventDates()]);

  private readonly params$ = this.route.queryParamMap.pipe(
    map((p): Params => {
      const query    = (p.get('query') ?? '').trim();    
      const dateFrom = p.get('dateFrom') ?? null;  
      const dateTo   = p.get('dateTo')   ?? null;  
      const sort     = (p.get('sort') as SortValue) ?? 'date_asc';
      const pageNo   = Number(p.get('pageNo') ?? '1') || 1;
      const pageSize = Number(p.get('pageSize') ?? '8') || 8;

      let sortBy  = 'eventDateTime';
      let sortDir: 'ASC' | 'DESC' = 'ASC';

      if (sort === 'name_asc')  { sortBy = 'name';          sortDir = 'ASC';  }
      if (sort === 'name_desc') { sortBy = 'name';          sortDir = 'DESC'; }
      if (sort === 'date_asc')  { sortBy = 'eventDateTime'; sortDir = 'ASC';  }
      if (sort === 'date_desc') { sortBy = 'eventDateTime'; sortDir = 'DESC'; }

      return { query, dateFrom, dateTo,sortBy, sortDir, pageNo, pageSize };
    }),
    tap((p) => {
      if (p.pageNo === 1) {
        this.pageCache.clear();
        this.hasMoreCache.clear();
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly vm$: Observable<ViewModel> = this.params$.pipe(
    switchMap((params) => this.fetchVm(params)),
    takeUntilDestroyed(this.destroyRef),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private fetchVm(params: Params): Observable<ViewModel> {
    const { pageNo, pageSize } = params;

    if (this.pageCache.has(pageNo)) {
      return of(this.buildVm(pageNo));
    }

    const loadingVm: ViewModel = {
      items: [], loading: true, loadingMore: pageNo > 1,
      hasMore: false, errorMsg: '', pageNo,
    };

    return this.eventService.searchEvents({
      query:    params.query || undefined,
      dateFrom: params.dateFrom ?? undefined,  
      dateTo:   params.dateTo   ?? undefined,   
      sortBy:   params.sortBy,
      sortDir:  params.sortDir,
      pageNo,
      pageSize,
    }).pipe(
      map((events: EventResponseDto[]) => {
        this.pageCache.set(pageNo, events.map((e) => this.toCardVm(e)));
        this.hasMoreCache.set(pageNo, events.length === pageSize);

        this.allKnownEventDates.update(existing => {
          const updated = new Set(existing);
          events.forEach(e => updated.add(e.eventDateTime.split('T')[0]));
          return updated;
        });

        return this.buildVm(pageNo);
      }),
      catchError(() => {
        return of<ViewModel>({
          items: [], loading: false, loadingMore: false,
          hasMore: false, errorMsg: 'Greška pri učitavanju događaja.', pageNo,
        });
      }),
      startWith(loadingVm)
    );
  }

  private buildVm(pageNo: number): ViewModel {
    return {
      items:       this.pageCache.get(pageNo) ?? [],
      loading:     false,
      loadingMore: false,
      hasMore:     this.hasMoreCache.get(pageNo) ?? false,
      errorMsg:    '',
      pageNo,
    };
  }

  onSearch(e: { query: string; sort: SortValue }): void {
    const dateFrom = this.route.snapshot.queryParamMap.get('dateFrom');
    const dateTo   = this.route.snapshot.queryParamMap.get('dateTo');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        query:    e.query?.trim() || null,
        sort:     e.sort || 'date_asc',
        dateFrom: dateFrom ?? null,   
        dateTo:   dateTo   ?? null,  
        pageNo:   1,
        pageSize: 8,
      },
      replaceUrl: true,
    });
  }

  nextPage(): void {
    const pageNo = Number(this.route.snapshot.queryParamMap.get('pageNo') ?? '1') || 1;
    this.router.navigate([], {
      relativeTo:          this.route,
      queryParams:         { pageNo: pageNo + 1 },
      queryParamsHandling: 'merge',
      replaceUrl:          true,
    });
  }

  onDateFilterChange(e: DateFilterChange): void {
  this.router.navigate([], {
    relativeTo:          this.route,
    queryParams: {
      dateFrom: e.dateFrom ?? null,
      dateTo:   e.dateTo   ?? null,
      pageNo:   1,
    },
    queryParamsHandling: 'merge',
    replaceUrl:          true,
  });
}

  prevPage(): void {
    const pageNo = Number(this.route.snapshot.queryParamMap.get('pageNo') ?? '1') || 1;
    this.router.navigate([], {
      relativeTo:          this.route,
      queryParams:         { pageNo: Math.max(1, pageNo - 1) },
      queryParamsHandling: 'merge',
      replaceUrl:          true,
    });
  }

 private toCardVm(e: EventResponseDto): EventCardVm {
    return {
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
                  featured:         e.featured ?? false,
                  trending:        e.trending,
    };
  
  }
}