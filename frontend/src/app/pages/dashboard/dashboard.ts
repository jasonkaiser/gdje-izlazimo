import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchBarComponent } from '../../components/other/search-bar/search-bar';
import { BgCardsMarqueeComponent } from '../../components/cards/bg-card/bg-card';
import { PopularVenuesCarouselComponent } from './sections/popular-venues/popular-venues';
import { CtaComponent } from './sections/cta/cta';
import { InViewDirective } from '../../core/animations/in-view.directive';
import { ScrollRevealDirective } from '../../core/animations/scroll-reveal.directive';

import { VenueResponseDto } from '../../core/models/venues/venue-response.dto';
import { VenueCategory } from '../../core/models/venues/venue-category.enum';
import { VenueService } from '../../core/api/venue-service';
import { EventService } from '../../core/api/event-service';

import { PopularEventsCarouselComponent } from './sections/popular-events/popular-events';
import { EventResponseDto } from '../../core/models/events/event-response.dto';
import { CategoryBadge, CategoryBadgeComponent } from '../../components/other/category-badge/category-badge';
import { TonightEventsCarouselComponent } from './sections/tonight-events/tonight-events';
import { OdluciZaMeneComponent } from './sections/odluci-za-mene/odluci-za-mene';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SearchBarComponent,
    BgCardsMarqueeComponent,
    PopularVenuesCarouselComponent,
    CategoryBadgeComponent,
    PopularEventsCarouselComponent,
    CommonModule,
    CtaComponent,
    InViewDirective,
    ScrollRevealDirective,
    TonightEventsCarouselComponent,
    OdluciZaMeneComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private venueService: VenueService,
    private eventService: EventService
  ) {}

  statsShown = false;
  reservations = 0;
  venuesCount = 0;

  wheelVenues: VenueResponseDto[] = [];
  popularVenues: VenueResponseDto[] = [];
  events: EventResponseDto[] = [];
  tonightEvents: EventResponseDto[] = [];
  tonightEventsLoading = true;
  popularVenuesLoading = true;
  eventsLoading = true;

  venues = [
    {
      id: 1,
      name: 'Viking Pub',
      imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 2,
      name: 'Sloga',
      imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 3,
      name: 'Silver & Smoke',
      imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 4,
      name: 'Underground',
      imageUrl: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 5,
      name: 'Old Town Bar',
      imageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=60',
    },
  ];

  categoryBadges: CategoryBadge[] = [
    {
      label: 'Klub',
      venueType: VenueCategory.CLUB,
      iconKey: 'club',
      iconColor: 'rgba(167,139,250,0.9)',
      pillStyle: 'background: linear-gradient(180deg, rgba(0,0,0,0.2) 70%, rgba(124,58,237,0.22) 100%), rgba(255,255,255,0.025); border: 1px solid rgba(124,58,237,0.28);',
    },
    {
      label: 'Lounge',
      venueType: VenueCategory.LOUNGE,
      iconKey: 'shisha',
      iconColor: 'rgba(96,165,250,0.9)',
      pillStyle: 'background: linear-gradient(180deg, rgba(0,0,0,0.2) 70%, rgba(58,121,237,0.22) 100%), rgba(255,255,255,0.025); border: 1px solid rgba(58,121,237,0.28);',
    },
    {
      label: 'Pub',
      venueType: VenueCategory.PUB,
      iconKey: 'pub',
      iconColor: 'rgba(251,191,36,0.9)',
      pillStyle: 'background: linear-gradient(180deg, rgba(0,0,0,0.2) 70%, rgba(255,180,0,0.2) 100%), rgba(255,255,255,0.025); border: 1px solid rgba(255,180,0,0.28);',
    },
    {
      label: 'Restoran',
      venueType: VenueCategory.RESTAURANT,
      iconKey: 'restoran',
      iconColor: 'rgba(52,211,153,0.9)',
      pillStyle: 'background: linear-gradient(180deg, rgba(0,0,0,0.2) 70%, rgba(16,185,129,0.22) 100%), rgba(255,255,255,0.025); border: 1px solid rgba(16,185,129,0.28);',
    },
  ];

  private readonly reservationsTarget = 100;
  private readonly venuesTarget = 50;

  private resRaf: number | null = null;
  private venRaf: number | null = null;
  private isCounting = false;
  private hasAnimatedStats = false;

  ngOnInit(): void {
    this.loadPopularVenues();
    this.loadUpcomingEvents();
    this.loadTonightEvents();
    this.loadWheelVenues();
  }

  ngOnDestroy(): void {
    this.stopCountUp();
  }

  private loadPopularVenues(): void {
    this.venueService
      .getVenues({ pageNo: 1, pageSize: 20, sortBy: 'name', sortDir: 'ASC' })
      .subscribe({
        next: (venues) => {
          this.popularVenues = [...venues].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0)).slice(0, 5);
          this.popularVenuesLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.popularVenuesLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private loadUpcomingEvents(): void {
    this.eventService
      .getUpcomingEvents()
      .subscribe({
        next: (events) => {
          this.events = events;
          this.eventsLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.eventsLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  goToVenuesByCategory(venueType: VenueCategory | null): void {
    if (!venueType) return;
    this.router.navigate(['/venues'], {
      queryParams: {
        venueType,
        sort: 'name_asc',
        pageNo: 1,
      },
    });
  }

  private loadTonightEvents(): void {
    const now = new Date();
    const tonightStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0, 0);
    const todayEnd     = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    this.eventService
      .getEvents({ pageNo: 1, pageSize: 50, sortBy: 'eventDateTime', sortDir: 'ASC' })
      .subscribe({
        next: (events) => {
          this.tonightEvents = events
            .filter(e => {
              if (!e.eventDateTime) return false;
              const d = new Date(e.eventDateTime);
              return d >= tonightStart && d <= todayEnd;
            })
            .slice(0, 6);
          this.tonightEventsLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.tonightEventsLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private loadWheelVenues(): void {
    this.venueService
      .getVenues({
        pageNo: 1,
        pageSize: 30,
        sortBy: 'name',
        sortDir: 'ASC',
      })
      .subscribe({
        next: (venues) => {
          this.wheelVenues = venues;
          this.cdr.detectChanges();
        },
        error: () => {
          this.wheelVenues = [];
          this.cdr.detectChanges();
        },
      });
  }

  get vecerasBadge(): CategoryBadge {
    return {
      label: 'Večeras',
      venueType: null,
      iconKey: 'veceras',
      iconColor: 'rgba(251,146,60,0.95)',
      pillStyle: 'background: linear-gradient(180deg, rgba(0,0,0,0.2) 70%, rgba(234,88,12,0.22) 100%), rgba(255,255,255,0.025); border: 1px solid rgba(234,88,12,0.75);',
      scrollTargetId: 'tonight-events-section',
    };
  }

  get hasTonightEvents(): boolean {
    return this.tonightEvents.length > 0;
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

  onOdluciZaMene(venue: VenueResponseDto): void {
    this.router.navigate(['/venues', venue.id]);
  }
}