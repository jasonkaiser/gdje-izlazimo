import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EventSearchBarComponent } from '../../components/other/event-search-bar/event-search-bar';
import { EventCard } from '../../components/cards/event-card/event-card';
import { EventService } from '../../core/api/event-service';
import { EventResponseDto } from '../../core/models/events/event-response.dto';

type SortValue = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc';

type EventCardVm = {
  id: string;
  title: string;
  venueName: string;
  venueAddress: string;
  imageUrl: string;
  eventDateTime: string;
  trending: boolean;
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
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  pageNo: number;
  pageSize: number;
};

@Component({
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.html',
  imports: [EventSearchBarComponent, EventCard, AsyncPipe],
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

  private readonly params$ = this.route.queryParamMap.pipe(
    map((p): Params => {
      const query    = (p.get('query') ?? '').trim();
      const sort     = (p.get('sort') as SortValue) ?? 'date_asc';
      const pageNo   = Number(p.get('pageNo') ?? '1') || 1;
      const pageSize = Number(p.get('pageSize') ?? '8') || 8;

      let sortBy  = 'eventDateTime';
      let sortDir: 'ASC' | 'DESC' = 'ASC';

      if (sort === 'name_asc')  { sortBy = 'name';          sortDir = 'ASC';  }
      if (sort === 'name_desc') { sortBy = 'name';          sortDir = 'DESC'; }
      if (sort === 'date_asc')  { sortBy = 'eventDateTime'; sortDir = 'ASC';  }
      if (sort === 'date_desc') { sortBy = 'eventDateTime'; sortDir = 'DESC'; }

      return { query, sortBy, sortDir, pageNo, pageSize };
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
      sortBy:   params.sortBy,
      sortDir:  params.sortDir,
      pageNo,
      pageSize,
    }).pipe(
      map((events: EventResponseDto[]) => {
        this.pageCache.set(pageNo, events.map((e) => this.toCardVm(e)));
        this.hasMoreCache.set(pageNo, events.length === pageSize);
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        query:    e.query?.trim() || null,
        sort:     e.sort || 'date_asc',
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
      id:            e.id,
      title:         e.name ?? '',
      venueName:     e.venueName ?? '',
      venueAddress:  e.venueAddress ?? '',
      imageUrl:      e.imageUrl ?? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
      eventDateTime: e.eventDateTime ?? '',
      trending:      e.trending ?? false
    };
  
  }
}