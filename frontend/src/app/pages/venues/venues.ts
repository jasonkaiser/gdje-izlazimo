import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SearchBarComponent } from '../../components/other/search-bar/search-bar';
import { VenueCard } from '../../components/cards/venue-card/venue-card';
import { VenueService } from '../../core/api/venue-service';
import { VenueCategory } from '../../core/models/venues/venue-category.enum';
import { VenueKind, VenueResponseDto } from '../../core/models/venues/venue-response.dto';

type SortValue = 'name_asc' | 'name_desc';

type VenueCardVm = {
  id: string;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  averageRating: number;
  totalRatings: number;
};

type ViewModel = {
  items: VenueCardVm[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
};

type Params = {
  query: string;
  venueType: VenueCategory | null;
  venueKind: VenueKind | null; 
  sortDir: 'ASC' | 'DESC';
  pageNo: number;
  pageSize: number;
};

@Component({
  selector: 'app-venues',
  standalone: true,
  templateUrl: './venues.html',
  imports: [SearchBarComponent, VenueCard, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenuesComponent {
  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly venueService = inject(VenueService);
  private readonly destroyRef   = inject(DestroyRef);

  readonly skeleton = Array.from({ length: 8 }, (_, i) => i);

  private readonly pageCache    = new Map<number, VenueCardVm[]>();
  private readonly hasMoreCache = new Map<number, boolean>();

  private readonly params$ = this.route.queryParamMap.pipe(
    map((p): Params => {
      const query    = (p.get('query') ?? '').trim();
      const venueType = (p.get('venueType') as VenueCategory) ?? null;
      const venueKind = p.get('venueKind') as VenueKind ?? null;
      const sort     = (p.get('sort') as SortValue) ?? 'name_asc';
      const pageNo   = Number(p.get('pageNo') ?? '1') || 1;
      const pageSize = Number(p.get('pageSize') ?? '6') || 6;

      return { query, venueType,venueKind, sortDir: sort === 'name_desc' ? 'DESC' : 'ASC', pageNo, pageSize };
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

    return this.venueService.searchVenues({
      query:     params.query || undefined,
      venueType: params.venueType ?? undefined,
      venueKind: params.venueKind ?? undefined,
      sortBy:    'id',
      sortDir:   'ASC',
      pageNo:    1,
      pageSize:  200,
    }).pipe(
      map((venues: VenueResponseDto[]) => {
        const sorted = [...venues].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
        const pageStart = (pageNo - 1) * pageSize;
        const pageItems = sorted.slice(pageStart, pageStart + pageSize);
        const hasMore   = pageStart + pageSize < sorted.length;

        this.pageCache.set(pageNo, pageItems.map((v) => this.toCardVm(v)));
        this.hasMoreCache.set(pageNo, hasMore);
        return this.buildVm(pageNo);
      }),
      catchError((err) => {
        return of<ViewModel>({
          items: [], loading: false, loadingMore: false,
          hasMore: false, errorMsg: 'Greška pri učitavanju lokala.', pageNo,
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

  onSearch(e: { query: string; venueType: VenueCategory | null; venueKind: any;  sort: SortValue }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        query:     e.query?.trim() || null,
        venueType: e.venueType || null,
        venueKind: e.venueKind || null,
        sort:      e.sort || 'name_asc',
        pageNo:    1,
        pageSize:  8,
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

  private toCardVm(v: VenueResponseDto): VenueCardVm {
    const primaryImage = [...(v.images ?? [])].sort((a, b) =>
      a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
    )[0];

    return {
      id:       v.id,
      title:    v.name ?? '',
      category: v.venueType ?? '',
      location: v.addressName ?? '',
      imageUrl: primaryImage?.imageUrl ?? this.getFallbackImage(v.venueType),
      averageRating: v.averageRating,
      totalRatings: v.totalRatings,
    };
  }

  private getFallbackImage(type: string): string {
    const fallbacks: Record<string, string> = {
      CLUB:       'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      PUB:        'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
      RESTAURANT: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      LOUNGE:     'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
    };
    return fallbacks[type] ?? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b';
  }
}