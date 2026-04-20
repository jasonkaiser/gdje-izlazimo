import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueCategory } from '../../../core/models/venues/venue-category.enum';

export interface CategoryBadge {
  label: string;
  venueType: VenueCategory;
  iconColor: string;
  pillStyle: string;
  iconKey: 'club' | 'shisha' | 'pub' | 'restoran';
}

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [CommonModule],
 template: `
  <button
    type="button"
    (click)="clicked.emit(badge.venueType)"
    class="flex items-center gap-[7px] h-[36px] pl-[10px] pr-[14px]
           rounded-full font-dm font-light text-[13px] text-white/82
           whitespace-nowrap transition-all duration-150
           hover:opacity-70 active:scale-95 cursor-pointer"
    [style]="badge.pillStyle"
  >
    <span class="w-[15px] h-[15px] flex items-center justify-center flex-shrink-0"
          [style.color]="badge.iconColor">
      @if (badge.iconKey === 'club') {
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
      }
      @if (badge.iconKey === 'shisha') {
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2c-1 2 1 3 1 5s-2 3-1 5"/><path d="M8 6h8"/><path d="M10 12v9"/><path d="M14 12v9"/><path d="M7 21h10"/>
        </svg>
      }
      @if (badge.iconKey === 'pub') {
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M5 7h14l-1.5 10H6.5Z"/><path d="M9 11v4M12 11v4"/>
        </svg>
      }
      @if (badge.iconKey === 'restoran') {
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/><path d="M21 15v7"/>
        </svg>
      }
    </span>
    {{ badge.label }}
  </button>
`,
})
export class CategoryBadgeComponent {
  @Input() badge!: CategoryBadge;
  @Output() clicked = new EventEmitter<VenueCategory>();
}