import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  DestroyRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  shareReplay,
  debounceTime,
  take,
  tap
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { VenueResponseDto } from '../../../../core/models/venues/venue-response.dto';
import { VenueCategory } from '../../../../core/models/venues/venue-category.enum';
import { UpdateVenueRequest } from '../../../../core/models/venues/update-venue.request';
import { VenueService } from '../../../../core/api/venue-service';
import { ModalService } from '../../../../core/services/modal';
import { ToastService } from '../../../../core/ui/toast'; 
import { ConfirmModalComponent } from '../../../../components/modals/confirm-modal/confirm-modal';
import { VenueModalComponent } from '../../../../components/modals/venue-modal/venue-modal';
import { AppDropdown } from '../../../../components/other/dropdown/dropdown';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type CategoryFilter = 'ALL' | VenueCategory;

interface VenueStats {
  total: number;
  active: number;
  inactive: number;
}

interface ViewModel {
  items: VenueResponseDto[];
  loading: boolean;
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
}

@Component({
  selector: 'app-admin-venues',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AppDropdown],
  templateUrl: './admin-venues.html',
  styleUrl: './admin-venues.css'
})
export class AdminVenuesComponent implements OnInit {
  
  private readonly venueService = inject(VenueService);
  private readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // State
  searchQuery = '';
  statusFilter: StatusFilter = 'ALL';
  categoryFilter: CategoryFilter = 'ALL';
  readonly pageSize = 10;

  // Premium dropdown options
  readonly statusFilterOptions = [
    { value: 'ALL' as const, label: 'Svi statusi' },
    { value: 'ACTIVE' as const, label: 'Aktivni' },
    { value: 'INACTIVE' as const, label: 'Neaktivni' }
  ];

  readonly categoryFilterOptions = [
    { value: 'ALL' as const, label: 'Sve kategorije' },
    { value: VenueCategory.CLUB, label: 'Klubovi' },
    { value: VenueCategory.PUB, label: 'Pubovi' },
    { value: VenueCategory.LOUNGE, label: 'Lounge' },
    { value: VenueCategory.RESTAURANT, label: 'Restorani' }
  ];

  // Subjects
  private readonly search$ = new BehaviorSubject<string>('');
  private readonly statusFilter$ = new BehaviorSubject<StatusFilter>('ALL');
  private readonly categoryFilter$ = new BehaviorSubject<CategoryFilter>('ALL');
  private readonly pageNo$ = new BehaviorSubject<number>(1);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  // Observables
  venues$!: Observable<VenueResponseDto[]>;
  stats$!: Observable<VenueStats>;
  vm$!: Observable<ViewModel>;

  ngOnInit(): void {
    console.log('[AdminVenues] Initializing component...');
    this.initializeStreams();
    this.setupEventListeners();
  }

  @HostListener('window:venue-updated')
  onVenueUpdated(): void {
    this.refresh$.next();
  }

  private setupEventListeners(): void {
    window.addEventListener('venue-updated', () => {
      this.refresh$.next();
    });
  }

  private initializeStreams(): void {
    console.log('[AdminVenues] Setting up streams...');
    
    // Load all venues
    this.venues$ = this.refresh$.pipe(
        tap(() => console.log('[AdminVenues] Refresh triggered')),
        switchMap(() =>
          this.venueService.getVenues({ 
            pageSize: 1000, 
            sortBy: 'id',
            sortDir: 'DESC' 
          }).pipe(
            tap(venues => console.log('[AdminVenues] Loaded venues:', venues.length)),
            catchError(err => {
              console.error('[AdminVenues] Failed to load venues:', err);
              this.toastService.show('Greška pri učitavanju lokala', 'error');
              return of([] as VenueResponseDto[]);
            })
          )
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
        takeUntilDestroyed(this.destroyRef)
      );

    // Calculate stats
    this.stats$ = this.venues$.pipe(
      map(venues => {
        const stats = {
          total: venues.length,
          active: venues.filter(v => v.isActive).length,
          inactive: venues.filter(v => !v.isActive).length
        };
        console.log('[AdminVenues] Stats:', stats);
        return stats;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    // View model with filters and pagination
    this.vm$ = this.venues$.pipe(
      switchMap(allVenues => 
        this.search$.pipe(
          debounceTime(300),
          switchMap(search =>
            this.statusFilter$.pipe(
              switchMap(statusFilter =>
                this.categoryFilter$.pipe(
                  switchMap(categoryFilter =>
                    this.pageNo$.pipe(
                      map(pageNo => {
                        // Apply filters
                        let filtered = this.applySearch(allVenues, search);
                        filtered = this.applyStatusFilter(filtered, statusFilter);
                        filtered = this.applyCategoryFilter(filtered, categoryFilter);

                        console.log('[AdminVenues] Filtered venues:', filtered.length);

                        // Paginate
                        const start = (pageNo - 1) * this.pageSize;
                        const end = start + this.pageSize;
                        const slice = filtered.slice(start, end);
                        const hasMore = end < filtered.length;

                        const vm = {
                          items: slice,
                          loading: false,
                          hasMore,
                          errorMsg: '',
                          pageNo
                        };
                        
                        console.log('[AdminVenues] ViewModel:', vm);
                        return vm;
                      })
                    )
                  )
                )
              )
            )
          )
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    // Subscribe to trigger initial load
    this.vm$.pipe(take(1)).subscribe(vm => {
      console.log('[AdminVenues] Initial ViewModel loaded:', vm);
    });
  }

  private applySearch(venues: VenueResponseDto[], search: string): VenueResponseDto[] {
    if (!search.trim()) return venues;
    
    const query = search.toLowerCase();
    return venues.filter(v =>
      v.name.toLowerCase().includes(query) ||
      v.addressName.toLowerCase().includes(query) ||
      v.phone.toLowerCase().includes(query)
    );
  }

  private applyStatusFilter(venues: VenueResponseDto[], filter: StatusFilter): VenueResponseDto[] {
    if (filter === 'ALL') return venues;
    return venues.filter(v => 
      filter === 'ACTIVE' ? v.isActive : !v.isActive
    );
  }

  private applyCategoryFilter(venues: VenueResponseDto[], filter: CategoryFilter): VenueResponseDto[] {
    if (filter === 'ALL') return venues;
    return venues.filter(v => v.venueType === filter);
  }

  onSearchChange(): void {
    this.search$.next(this.searchQuery);
    this.pageNo$.next(1);
  }

  onFilterChange(): void {
    this.statusFilter$.next(this.statusFilter);
    this.categoryFilter$.next(this.categoryFilter);
    this.pageNo$.next(1);
  }

  nextPage(): void {
    this.pageNo$.next(this.pageNo$.getValue() + 1);
  }

  prevPage(): void {
    const current = this.pageNo$.getValue();
    if (current > 1) this.pageNo$.next(current - 1);
  }

  getCategoryLabel(category: VenueCategory): string {
    const labels: Record<VenueCategory, string> = {
      [VenueCategory.CLUB]: 'Klub',
      [VenueCategory.PUB]: 'Pub',
      [VenueCategory.LOUNGE]: 'Lounge',
      [VenueCategory.RESTAURANT]: 'Restoran'
    };
    return labels[category];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('bs-BA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  openCreateVenueModal(): void {
    const modalRef = this.modalService.open(VenueModalComponent, {
      data: { mode: 'create' }
    });
  }

  viewVenue(venue: VenueResponseDto): void {
    this.editVenue(venue);
  }

  editVenue(venue: VenueResponseDto): void {
    const modalRef = this.modalService.open(VenueModalComponent, {
      data: { mode: 'edit', venue }
    });
  }

  toggleVenueStatus(venue: VenueResponseDto): void {
    const newStatus = !venue.isActive;
    const updateRequest: UpdateVenueRequest = {
      name: venue.name,
      venueType: venue.venueType,
      phone: venue.phone,
      description: venue.description,
      isActive: newStatus,
      addressName: venue.addressName
    };

    this.venueService.updateVenue(updateRequest, venue.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.refresh$.next();
          this.toastService.show(
            `Lokal ${newStatus ? 'aktiviran' : 'deaktiviran'}`, 
            'success'
          );
        },
        error: err => {
          console.error('[AdminVenues] Failed to toggle status:', err);
          this.toastService.show('Greška pri promjeni statusa', 'error');
        }
      });
  }

  deleteVenue(venue: VenueResponseDto): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      data: {
        title: 'Obriši Lokal',
        message: `Da li ste sigurni da želite obrisati lokal "${venue.name}"?\n\nOva akcija se ne može poništiti.`,
        confirmText: 'Obriši',
        cancelText: 'Otkaži',
        variant: 'danger'
      }
    });

    (modalRef.instance as ConfirmModalComponent).confirmed
      .pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this.venueService.deleteVenue(venue.id)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.refresh$.next();
                this.toastService.show('Lokal uspješno obrisan', 'success');
              },
              error: err => {
                console.error('[AdminVenues] Failed to delete venue:', err);
                this.toastService.show('Greška pri brisanju lokala', 'error');
              }
            });
        }
      });
  }
}