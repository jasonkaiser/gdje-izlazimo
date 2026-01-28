import { Component, Input, OnDestroy } from '@angular/core';

export type BgVenueCard = {
  id: string | number;
  name: string;
  imageUrl: string;
};

@Component({
  selector: 'app-bg-cards-marquee',
  standalone: true,
  templateUrl: './bg-card.html',
})
export class BgCardsMarqueeComponent implements OnDestroy {
    @Input({ required: true }) venues: BgVenueCard[] = [];
    @Input() twoRows = true;

    @Input() venueNames: string[] = [
    'SLOGA',
    'SILVER & SMOKE',
    'VIKING PUB',
    'CITY PUB',
    'TESLA',
    'LOFT',
    'ARGELINI',
    'LIFT',
    'SCENA BAR',
    'MOCCA CAFFE',
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

  ngOnDestroy() {
    clearTimeout(this.clearTimer);
  }
}
