import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

type VenueTypeOption = { label: string; value: string | null };

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<{ query: string; type: string | null }>();

  query = '';
  typesOpen = false;

  types: VenueTypeOption[] = [
    { label: 'Svi', value: null },
    { label: 'Klub', value: 'CLUB' },
    { label: 'Pub', value: 'PUB' },
    { label: 'Restoran', value: 'RESTAURANT' },
    { label: 'Kafić', value: 'CAFE' },
  ];

  selectedType: VenueTypeOption = this.types[0];

  get selectedTypeLabel() {
    return this.selectedType.label ?? 'Tip lokala';
  }

  toggleTypes() {
    this.typesOpen = !this.typesOpen;
  }

  selectType(t: VenueTypeOption) {
    this.selectedType = t;
    this.typesOpen = false;

  }

  onSearch() {
    this.search.emit({ query: this.query.trim(), type: this.selectedType.value });
  }
}
