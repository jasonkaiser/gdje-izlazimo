import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BgVenueCard = {
  id: string | number;
  name: string;
  imageUrl: string;
};

@Component({
  selector: 'app-bg-cards-marquee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bg-card.html',
  styleUrl: './bg-card.css',
})
export class BgCardsMarqueeComponent implements OnDestroy {
  @Input({ required: true }) venues: BgVenueCard[] = [];
  @Input() twoRows = true;

  @Input() venueNames: string[] = [
    'SLOGA', 'SILVER & SMOKE', 'VIKING PUB', 'CITY PUB', 'TESLA',
    'LOFT', 'ARGELINI', 'LIFT', 'SCENA BAR', 'MOCCA CAFFE',
  ];

  activeId: string | null = null;
  private clearTimer: any;

  setActive(id: string) {
    this.activeId = this.activeId === id ? null : id;
    clearTimeout(this.clearTimer);
    this.clearTimer = setTimeout(() => {
      this.activeId = null;
    }, 1800);
  }

  bgStyle(imageUrl: string, id: string): Record<string, string> {
    const isActive = this.activeId === id;
    const overlay = isActive
      ? 'linear-gradient(173.73deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.10) 100%)'
      : 'linear-gradient(173.73deg, rgba(74,74,74,0) -10.29%, #000000 88.89%)';
    return {
      'background-image': `${overlay}, url(${imageUrl})`,
      'background-size': 'cover',
      'background-position': 'center',
      'filter': isActive ? 'grayscale(0%)' : 'grayscale(100%)',
    };
  }

  ngOnDestroy() {
    clearTimeout(this.clearTimer);
  }
}