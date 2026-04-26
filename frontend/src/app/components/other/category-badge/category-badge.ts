import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueCategory } from '../../../core/models/venues/venue-category.enum';

export interface CategoryBadge {
  label: string;
  venueType: VenueCategory | null;
  iconColor: string;
  pillStyle: string;
  iconKey: 'club' | 'shisha' | 'pub' | 'restoran' | 'veceras';
  scrollTargetId?: string; 
}

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
      <button
        type="button"
        (click)="onClicked()"
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
        @if (badge.iconKey === 'veceras') {
          <!-- Fire SVG -->
          <svg width="13" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 23C7.58 23 4 19.42 4 15c0-2.67 1.28-4.6 2.53-6.47C7.78 6.66 9 4.88 9 2.5c0-.42.25-.8.64-.96.38-.16.83-.07 1.12.22.05.05 1.24 1.24 1.82 3.06C13.52 3.6 14.5 2.16 14.5.5c0-.38.21-.72.56-.89.34-.16.74-.11 1.03.13C16.77 .94 20 3.7 20 9c0 1.5-.3 2.82-.79 3.97C19.73 13.55 20 14.26 20 15c0 4.42-3.58 8-8 8z"/>
          </svg>
        }
      </span>
      {{ badge.label }}
    </button>
  `,
})
export class CategoryBadgeComponent {
  @Input() badge!: CategoryBadge;
  @Input() isActive = false;
  @Output() clicked = new EventEmitter<VenueCategory | null>();

  onClicked(): void {
    if (this.badge.scrollTargetId) {
      const el = document.getElementById(this.badge.scrollTargetId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (this.badge.venueType !== null) {
      this.clicked.emit(this.badge.venueType);
    }
  }
}