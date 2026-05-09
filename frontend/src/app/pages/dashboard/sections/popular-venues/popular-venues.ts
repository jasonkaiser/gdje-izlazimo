import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VenueCard } from '../../../../components/cards/venue-card/venue-card';
import { VenueResponseDto } from '../../../../core/models/venues/venue-response.dto';
import { VenueCategory } from '../../../../core/models/venues/venue-category.enum';

type VenueCardVm = {
  id: string;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  averageRating: number;
  totalRatings: number;
};

@Component({
  selector: 'app-popular-venues',
  standalone: true,
  imports: [VenueCard],
  templateUrl: './popular-venues.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularVenuesCarouselComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) set venues(raw: VenueResponseDto[]) {
    this._venues = raw.map((v) => this.toCardVm(v));
  }
  @Input() title = '';
  @Input() subtitle = '';

  _venues: VenueCardVm[] = [];

  @ViewChild('scroller') scroller?: ElementRef<HTMLDivElement>;

  canPrev = false;
  canNext = false;

  private scrollEndTimer: any;
  private isProgrammaticScroll = false;
  private isDesktop = false;
  private peekIndex = { left: -1, right: -1 };
  private ro?: ResizeObserver;
  private readonly isBrowser: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.updateIsDesktop();
    const el = this.scroller?.nativeElement;
    if (!el) return;

    setTimeout(() => this.refreshNav(), 0);
    setTimeout(() => this.refreshNav(), 250);

    this.zone.runOutsideAngular(() => {
      if (typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.zone.run(() => {
          this.updateIsDesktop();
          this.refreshNav();
        }));
        this.ro.observe(el);
      }

      el.querySelectorAll('img').forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', this.onImgLoad, { passive: true });
        }
      });

      window.addEventListener('resize', this.onResize, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    clearTimeout(this.scrollEndTimer);
    this.ro?.disconnect();
    window.removeEventListener('resize', this.onResize);

    this.scroller?.nativeElement
      .querySelectorAll('img')
      .forEach((img) => img.removeEventListener('load', this.onImgLoad as any));
  }

  private onResize = (): void => {
    this.zone.run(() => {
      this.updateIsDesktop();
      this.refreshNav();
    });
  };

  private onImgLoad = (): void => {
    this.zone.run(() => this.refreshNav());
  };

  private updateIsDesktop(): void {
    this.isDesktop = window.matchMedia('(min-width: 640px)').matches;
  }

  private refreshNav(): void {
    this.updateNavState();
    this.cdr.detectChanges();
  }

  onScroll(): void {
    if (!this.isBrowser) return;
    this.updateNavState();

    if (!this.isDesktop || this.isProgrammaticScroll) return;

    clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = setTimeout(() => {
      this.zone.run(() => this.snapToNearestStart());
    }, 90);
  }

  scrollPrev(): void { this.scrollByCard(-1); }
  scrollNext(): void { this.scrollByCard(1); }

  isPeekDesktopLeftOrRight(i: number): boolean {
    return this.isDesktop && (i === this.peekIndex.left || i === this.peekIndex.right);
  }

  private scrollByCard(dir: -1 | 1): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    this.isProgrammaticScroll = true;
    clearTimeout(this.scrollEndTimer);

    const cards = this.getCards(el);
    if (!cards.length) return;

    let targetIndex = 0;
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].offsetLeft <= el.scrollLeft + 10) targetIndex = i;
    }

    const newIndex = Math.max(0, Math.min(cards.length - 1, targetIndex + dir));
    el.scrollTo({ left: cards[newIndex].offsetLeft, behavior: 'smooth' });

    setTimeout(() => {
      this.isProgrammaticScroll = false;
      this.updateNavState();
    }, 400);
  }

  private snapToNearestStart(): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    const cards = this.getCards(el);
    if (!cards.length) return;

    const left = el.scrollLeft;
    let nearest = cards[0];
    let nearestDist = Infinity;

    for (const c of cards) {
      const dist = Math.abs(c.offsetLeft - left);
      if (dist < nearestDist) { nearestDist = dist; nearest = c; }
    }

    if (Math.abs(nearest.offsetLeft - left) > 5) {
      el.scrollTo({ left: nearest.offsetLeft, behavior: 'smooth' });
    }
  }

  private updateNavState(): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const eps = 2;
    const newCanPrev = el.scrollLeft > eps;
    const newCanNext = el.scrollLeft < max - eps;

    if (this.canPrev !== newCanPrev || this.canNext !== newCanNext) {
      this.canPrev = newCanPrev;
      this.canNext = newCanNext;
      this.cdr.markForCheck();
    }

    if (this.isDesktop) this.computePeekIndices(el);
    else this.peekIndex = { left: -1, right: -1 };
  }

  private computePeekIndices(el: HTMLDivElement): void {
    const cards = this.getCards(el);
    if (!cards.length) return;

    const viewLeft = el.scrollLeft;
    const viewRight = viewLeft + el.clientWidth;
    const eps = 2;
    let left = -1;
    let right = -1;

    for (let i = 0; i < cards.length; i++) {
      const cardLeft = cards[i].offsetLeft;
      const cardRight = cardLeft + cards[i].offsetWidth;
      if (cardLeft < viewLeft - eps && cardRight > viewLeft + eps && viewLeft > eps) left = i;
      if (cardLeft < viewRight - eps && cardRight > viewRight + eps) right = i;
    }

    if (this.peekIndex.left !== left || this.peekIndex.right !== right) {
      this.peekIndex = { left, right };
      this.cdr.markForCheck();
    }
  }

  private getCards(el: HTMLElement): HTMLElement[] {
    return Array.from(el.querySelectorAll<HTMLElement>('[data-card]'));
  }

  private toCardVm(v: VenueResponseDto): VenueCardVm {
    const primaryImage = [...(v.images ?? [])].sort((a, b) =>
      a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
    )[0];

    return {
      id:       v.id,
      title:    v.name ?? '',
      category: v.venueType ?? '',
      location: v.addressName ?? '',
      imageUrl: primaryImage?.imageUrl ?? this.getFallbackImage(v.venueType),
      averageRating: v.averageRating ?? 0,
      totalRatings:  v.totalRatings ?? 0,
    
    };
  }

  private getFallbackImage(type: VenueCategory | string): string {
    const fallbacks: Record<string, string> = {
      CLUB:       'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      PUB:        'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
      RESTAURANT: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      LOUNGE:     'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
    };
    return fallbacks[type] ?? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b';
  }
}