import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SearchBarComponent } from '../../components/other/search-bar/search-bar';
import { VenueCard } from '../../components/cards/venue-card/venue-card';

import { VenueService } from '../../core/api/venue-service';
import { VenueCategory } from '../../core/models/venues/venue-category.enum';
import { VenueResponseDto } from '../../core/models/venues/venue-response.dto';

type SortValue = 'name_asc' | 'name_desc';

type VenueCardVm = {
  id: string;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly venueService = inject(VenueService);
  private readonly destroyRef = inject(DestroyRef);

  readonly skeleton = Array.from({ length: 8 }, (_, i) => i);

  private pageCache = new Map<number, VenueCardVm[]>();
  private hasMoreCache = new Map<number, boolean>();

  private readonly params$ = this.route.queryParamMap.pipe(
    map((p): Params => {
      const query = (p.get('query') ?? '').trim();
      const venueType = (p.get('venueType') as VenueCategory) ?? null;
      const sort = (p.get('sort') as SortValue) ?? 'name_asc';

      const pageNo = Number(p.get('pageNo') ?? '1') || 1;
      const pageSize = Number(p.get('pageSize') ?? '6') || 6;

      const sortDir: 'ASC' | 'DESC' = sort === 'name_desc' ? 'DESC' : 'ASC';

      return { query, venueType, sortDir, pageNo, pageSize };
    }),
    tap((p) => {
      // reset cache on new search/filter (your onSearch sets pageNo=1)
      if (p.pageNo === 1) {
        this.pageCache.clear();
        this.hasMoreCache.clear();
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly vm$: Observable<ViewModel> = this.params$.pipe(
    switchMap((params) => this.getVmForParams(params)),
    takeUntilDestroyed(this.destroyRef),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private getVmForParams(params: Params): Observable<ViewModel> {
    const { pageNo, pageSize } = params;

    const cached = this.pageCache.get(pageNo);
    if (cached) {
      return of(this.buildVm(pageNo));
    }

    const initialVm: ViewModel = {
      items: [], // for pagination we don’t show previous page cards
      loading: pageNo === 1,
      loadingMore: pageNo > 1,
      hasMore: this.hasMoreCache.get(pageNo - 1) ?? true,
      errorMsg: '',
      pageNo,
    };

    return this.venueService
      .searchVenues({
        query: params.query ? params.query : undefined,
        venueType: params.venueType ?? undefined,
        sortBy: 'name',
        sortDir: params.sortDir,
        pageNo,
        pageSize,
      })
      .pipe(
        map((res: VenueResponseDto[]) => {
          const mapped = res.map((v) => this.toCardVm(v));
          const hasMore = res.length === pageSize;

          this.pageCache.set(pageNo, mapped);
          this.hasMoreCache.set(pageNo, hasMore);

          return this.buildVm(pageNo);
        }),
        catchError((err) => {
          console.error('Error loading venues:', err);
          const vm: ViewModel = {
            items: [],
            loading: false,
            loadingMore: false,
            hasMore: false,
            errorMsg: 'Greška pri učitavanju lokala.',
            pageNo,
          };
          return of(vm);
        }),
        // emit loading state first, then final VM
        switchMap((finalVm) => of(initialVm, finalVm))
      );
  }

  private buildVm(pageNo: number): ViewModel {
    return {
      items: this.pageCache.get(pageNo) ?? [],
      loading: false,
      loadingMore: false,
      hasMore: this.hasMoreCache.get(pageNo) ?? true,
      errorMsg: '',
      pageNo,
    };
  }

  onSearch(e: { query: string; venueType: VenueCategory | null; sort: SortValue }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        query: e.query?.trim() ? e.query.trim() : null,
        venueType: e.venueType ? e.venueType : null,
        sort: e.sort || 'name_asc',
        pageNo: 1,
        pageSize: 8,
      },
      replaceUrl: true,
    });
  }

  nextPage(): void {
    const snapshot = this.route.snapshot.queryParamMap;
    const pageNo = Number(snapshot.get('pageNo') ?? '1') || 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageNo: pageNo + 1 },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  prevPage(): void {
    const snapshot = this.route.snapshot.queryParamMap;
    const pageNo = Number(snapshot.get('pageNo') ?? '1') || 1;
    const next = Math.max(1, pageNo - 1);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageNo: next },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private toCardVm(v: VenueResponseDto): VenueCardVm {
    return {
      id: v.id,
      title: v.name ?? '',
      category: v.venueType ?? '',
      location: v.addressName ?? '',
      imageUrl: this.mapVenueImage(v.venueType),
    };
  }

  private mapVenueImage(type: string): string {
    const imageMap: Record<string, string> = {
      CLUB: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      PUB: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
      RESTAURANT: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      LOUNGE: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
    };
    return imageMap[type] ?? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b';
  }
}
