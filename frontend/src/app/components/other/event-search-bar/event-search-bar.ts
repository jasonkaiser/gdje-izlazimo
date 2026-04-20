import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SortValue = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc';
type SortOption = { label: string; value: SortValue };

@Component({
  selector: 'app-event-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './event-search-bar.html',
})
export class EventSearchBarComponent implements OnDestroy {
  @Input() live = false;
  @Input() debounceMs = 300;

  @Output() search = new EventEmitter<{
    query: string;
    sort:  SortValue;
  }>();

  query    = '';
  sortOpen = false;

  sorts: SortOption[] = [
    { label: 'Datum: Najstariji',  value: 'date_asc'  },
    { label: 'Datum: Najnoviji',   value: 'date_desc' },
    { label: 'Naziv: A → Z',       value: 'name_asc'  },
    { label: 'Naziv: Z → A',       value: 'name_desc' },
  ];

  selectedSort: SortOption = this.sorts[0];

  private typingTimer: any;

  ngOnDestroy(): void {
    clearTimeout(this.typingTimer);
  }

  hasActiveFilters(): boolean {
    return this.selectedSort.value !== 'date_asc';
  }

  toggleSort(): void {
    this.sortOpen = !this.sortOpen;
  }

  selectSort(s: SortOption): void {
    this.selectedSort = s;
    this.sortOpen     = false;
    if (this.live) this.emitSearch();
  }

  onSearch(): void {
    clearTimeout(this.typingTimer);
    this.emitSearch();
  }

  onQueryChange(): void {
    if (!this.live) return;
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => this.emitSearch(), this.debounceMs);
  }

  private emitSearch(): void {
    this.search.emit({
      query: (this.query ?? '').trim(),
      sort:  this.selectedSort.value,
    });
  }
}