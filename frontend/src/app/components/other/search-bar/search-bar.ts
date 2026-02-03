import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VenueCategory } from '../../../core/models/venues/venue-category.enum';

type VenueTypeOption = { label: string; value: VenueCategory | null };
type SortOption = { label: string; value: 'name_asc' | 'name_desc' };

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
    query: string;
    venueType: VenueCategory | null;
    sort: 'name_asc' | 'name_desc';
  }>();

  query = '';

  typesOpen = false;
  sortOpen = false;
  filtersOpen = false;

  types: VenueTypeOption[] = [
    { label: 'Svi', value: null },
    { label: 'Klub', value: VenueCategory.CLUB },
    { label: 'Pub', value: VenueCategory.PUB },
    { label: 'Restoran', value: VenueCategory.RESTAURANT },
    { label: 'Lounge', value: VenueCategory.LOUNGE },
  ];

  sorts: SortOption[] = [
    { label: 'Naziv: A → Z', value: 'name_asc' },
    { label: 'Naziv: Z → A', value: 'name_desc' },
  ];

  selectedType: VenueTypeOption = this.types[0];
  selectedSort: SortOption = this.sorts[0];

  private typingTimer: any;

  ngOnDestroy(): void {
    clearTimeout(this.typingTimer);
  }

  toggleTypes() {
    this.typesOpen = !this.typesOpen;
    this.sortOpen = false;
    this.filtersOpen = false;
  }

  toggleSort() {
    this.sortOpen = !this.sortOpen;
    this.typesOpen = false;
    this.filtersOpen = false;
  }

  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
    this.typesOpen = false;
    this.sortOpen = false;
  }

  selectType(t: VenueTypeOption) {
    this.selectedType = t;
    this.typesOpen = false;
    if (this.live) this.emitSearch(); 
  }

  selectSort(s: SortOption) {
    this.selectedSort = s;
    this.sortOpen = false;
    if (this.live) this.emitSearch();
  }

  selectTypeFromFilters(t: VenueTypeOption) {
    this.selectedType = t;
    this.filtersOpen = false;
    if (this.live) this.emitSearch();
  }

  selectSortFromFilters(s: SortOption) {
    this.selectedSort = s;
    this.filtersOpen = false;
    if (this.live) this.emitSearch();
  }

  onSearch() {
    clearTimeout(this.typingTimer);
    this.emitSearch(); 
  }

  onQueryChange() {
    if (!this.live) return; 

    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.emitSearch();
    }, this.debounceMs);
  }

  private emitSearch() {
    this.search.emit({
      query: (this.query ?? '').trim(),
      venueType: this.selectedType.value,
      sort: this.selectedSort.value,
    });
  }
}
