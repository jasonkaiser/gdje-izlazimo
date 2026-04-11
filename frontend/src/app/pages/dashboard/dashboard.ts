import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchBarComponent } from '../../components/other/search-bar/search-bar';
import { BgCardsMarqueeComponent } from '../../components/cards/bg-card/bg-card';
import { PopularVenuesCarouselComponent } from './sections/popular-venues/popular-venues';
import { HowItWorksSectionComponent } from './sections/how-it-works/how-it-works';
import { CtaComponent } from './sections/cta/cta';
import { InViewDirective } from '../../core/animations/in-view.directive';

import { VenueResponseDto } from '../../core/models/venues/venue-response.dto';
import { VenueCategory } from '../../core/models/venues/venue-category.enum';
import { VenueService } from '../../core/api/venue-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SearchBarComponent,
    BgCardsMarqueeComponent,
    PopularVenuesCarouselComponent,
    HowItWorksSectionComponent,
    CommonModule,
    CtaComponent,
    InViewDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnDestroy {
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private venueService: VenueService
  ) {}

  statsShown = false;
  reservations = 0;
  venuesCount = 0;

  popularVenues: VenueResponseDto[] = [];
  popularVenuesLoading = true;

  venues = [
    {
      id: 1,
      name: 'Viking Pub',
      imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=60&sat=-100',
    },
    {
      id: 2,
      name: 'Sloga',
      imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=60&sat=-100',
    },
    {
      id: 3,
      name: 'Silver & Smoke',
      imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=60&sat=-100',
    },
    {
      id: 4,
      name: 'Underground',
      imageUrl: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=60&sat=-100',
    },
    {
      id: 5,
      name: 'Old Town Bar',
      imageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=60&sat=-100',
    },
  ];

  private readonly reservationsTarget = 10000;
  private readonly venuesTarget = 100;

  private resRaf: number | null = null;
  private venRaf: number | null = null;
  private isCounting = false;
  private hasAnimatedStats = false;

  ngOnInit(): void {
    this.loadPopularVenues();
  }

  ngOnDestroy(): void {
    this.stopCountUp();
  }

  private loadPopularVenues(): void {
    this.venueService
      .getVenues({ pageNo: 1, pageSize: 5, sortBy: 'name', sortDir: 'ASC' })
      .subscribe({
        next: (venues) => {
          this.popularVenues = venues;
          this.popularVenuesLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.popularVenuesLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onStatsInView(inView: boolean): void {
    this.statsShown = inView;

    if (inView && !this.hasAnimatedStats) {
      this.hasAnimatedStats = true;
      this.reservations = 0;
      this.venuesCount = 0;
      this.startCountUp();
    }
  }

  private startCountUp(): void {
    if (this.isCounting) return;
    this.isCounting = true;
    this.animateNumber('res', this.reservationsTarget, 1400);
    this.animateNumber('ven', this.venuesTarget, 900);
  }

  private stopCountUp(): void {
    if (this.resRaf) cancelAnimationFrame(this.resRaf);
    if (this.venRaf) cancelAnimationFrame(this.venRaf);
    this.resRaf = null;
    this.venRaf = null;
  }

  private animateNumber(type: 'res' | 'ven', target: number, duration: number): void {
    const start = performance.now();

    const tick = (now: number) => {
      if (!this.statsShown) return;

      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);

      if (type === 'res') this.reservations = value;
      else this.venuesCount = value;

      this.cdr.detectChanges();

      if (t < 1) {
        const id = requestAnimationFrame(tick);
        if (type === 'res') this.resRaf = id;
        else this.venRaf = id;
      } else {
        if (type === 'res') this.resRaf = null;
        else this.venRaf = null;
        if (!this.resRaf && !this.venRaf) this.isCounting = false;
      }
    };

    const id = requestAnimationFrame(tick);
    if (type === 'res') this.resRaf = id;
    else this.venRaf = id;
  }

  goToVenues(e: { query: string; venueType: VenueCategory | null; sort: 'name_asc' | 'name_desc' }): void {
    this.router.navigate(['/venues'], {
      queryParams: {
        query: e.query?.trim() || null,
        venueType: e.venueType || null,
        sort: e.sort || 'name_asc',
        pageNo: 1,
      },
    });
  }
}