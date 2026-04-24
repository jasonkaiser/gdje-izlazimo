import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VenueCategory } from '../../../core/models/venues/venue-category.enum';
import { VenueKind } from '../../../core/models/venues/venue-response.dto';


type VenueTypeOption = { label: string; value: VenueCategory | null };
type VenueKindOption = { label: string; value: VenueKind | null };
type SortOption      = { label: string; value: 'name_asc' | 'name_desc' };

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
})
export class SearchBarComponent implements OnDestroy {
  @Input() live = false;
  @Input() debounceMs = 300;

  @Output() search = new EventEmitter<{
    query:     string;
    venueType: VenueCategory | null;
    venueKind: VenueKind | null;
    sort:      'name_asc' | 'name_desc';
  }>();

  query = '';

  typesOpen   = false;
  kindsOpen   = false;
  sortOpen    = false;
  filtersOpen = false;

  mobileTypesOpen = false;
  mobileKindsOpen = false;
  mobileSortOpen  = false;

  types: VenueTypeOption[] = [
    { label: 'Svi',       value: null },
    { label: 'Klub',      value: VenueCategory.CLUB },
    { label: 'Pub',       value: VenueCategory.PUB },
    { label: 'Restoran',  value: VenueCategory.RESTAURANT },
    { label: 'Lounge',    value: VenueCategory.LOUNGE },
  ];

  kinds: VenueKindOption[] = [
    { label: 'Svi',      value: null },
    { label: 'Partner',  value: VenueKind.PARTNER },
    { label: 'Listed',   value: VenueKind.LISTED },
  ];

  sorts: SortOption[] = [
    { label: 'Naziv: A → Z', value: 'name_asc' },
    { label: 'Naziv: Z → A', value: 'name_desc' },
  ];

  selectedType: VenueTypeOption = this.types[0];
  selectedKind: VenueKindOption = this.kinds[0];
  selectedSort: SortOption      = this.sorts[0];

  private typingTimer: any;

  ngOnDestroy(): void {
    clearTimeout(this.typingTimer);
  }

  hasActiveFilters(): boolean {
    return this.selectedType.value !== null
        || this.selectedKind.value !== null
        || this.selectedSort.value !== 'name_asc';
  }

  toggleTypes(): void {
    this.typesOpen   = !this.typesOpen;
    this.kindsOpen   = false;
    this.sortOpen    = false;
    this.filtersOpen = false;
  }

  toggleKinds(): void {
    this.kindsOpen   = !this.kindsOpen;
    this.typesOpen   = false;
    this.sortOpen    = false;
    this.filtersOpen = false;
  }

  toggleSort(): void {
    this.sortOpen    = !this.sortOpen;
    this.typesOpen   = false;
    this.kindsOpen   = false;
    this.filtersOpen = false;
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
    this.typesOpen   = false;
    this.kindsOpen   = false;
    this.sortOpen    = false;
    if (!this.filtersOpen) {
      this.mobileTypesOpen = false;
      this.mobileKindsOpen = false;
      this.mobileSortOpen  = false;
    }
  }

  selectType(t: VenueTypeOption): void {
    this.selectedType = t;
    this.typesOpen    = false;
    if (this.live) this.emitSearch();
  }

  selectKind(k: VenueKindOption): void {
    this.selectedKind = k;
    this.kindsOpen    = false;
    if (this.live) this.emitSearch();
  }

  selectSort(s: SortOption): void {
    this.selectedSort = s;
    this.sortOpen     = false;
    if (this.live) this.emitSearch();
  }

  selectTypeFromFilters(t: VenueTypeOption): void {
    this.selectedType = t;
    if (this.live) this.emitSearch();
  }

  selectKindFromFilters(k: VenueKindOption): void {
    this.selectedKind = k;
    if (this.live) this.emitSearch();
  }

  selectSortFromFilters(s: SortOption): void {
    this.selectedSort = s;
    if (this.live) this.emitSearch();
  }

  onSearch(): void {
    clearTimeout(this.typingTimer);
    this.filtersOpen = false;
    this.emitSearch();
  }

  onQueryChange(): void {
    if (!this.live) return;
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => this.emitSearch(), this.debounceMs);
  }

  private emitSearch(): void {
    this.search.emit({
      query:     (this.query ?? '').trim(),
      venueType: this.selectedType.value,
      venueKind: this.selectedKind.value,
      sort:      this.selectedSort.value,
    });
  }
}