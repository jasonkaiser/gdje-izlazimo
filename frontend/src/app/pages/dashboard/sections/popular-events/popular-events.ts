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
import { EventCard } from '../../../../components/cards/event-card/event-card';
import { EventResponseDto } from '../../../../core/models/events/event-response.dto';

type EventCardVm = {
  id: string;
  title: string;
  venueName: string;
  venueAddress: string;
  locationName: string;
  locationAddress: string;
  venueId: string | null;
  eventType: string | null;
  imageUrl: string;
  eventDateTime: string;
  viewCount: number;
  trending: boolean;
  featured: boolean;
};

@Component({
  selector: 'app-popular-events',
  standalone: true,
  imports: [EventCard],
  templateUrl: './popular-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularEventsCarouselComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) set events(raw: EventResponseDto[]) {
    this._events = this.shuffle(raw.map((e) => this.toCardVm(e)));
    if (this.isBrowser) {
      setTimeout(() => this.refreshNav(), 0);
      setTimeout(() => this.refreshNav(), 250);
    }
  }
  @Input() title = '';
  @Input() subtitle = '';

  _events: EventCardVm[] = [];

  @ViewChild('scroller') scroller?: ElementRef<HTMLDivElement>;

  canPrev = false;
  canNext = false;

  private scrollEndTimer: any;
  private isProgrammaticScroll = false;
  private isDesktop = false;
  private peekIndex = { left: -1, right: -1 };
  private ro?: ResizeObserver;
  private readonly isBrowser: boolean;
  readonly pageSize = 4;

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
        this.ro = new ResizeObserver(() =>
          this.zone.run(() => { this.updateIsDesktop(); this.refreshNav(); })
        );
        this.ro.observe(el);
      }
      window.addEventListener('resize', this.onResize, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    clearTimeout(this.scrollEndTimer);
    this.ro?.disconnect();
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    this.zone.run(() => { this.updateIsDesktop(); this.refreshNav(); });
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

  get pagedEvents(): EventCardVm[][] {
    const pages: EventCardVm[][] = [];
    for (let i = 0; i < this._events.length; i += this.pageSize) {
      pages.push(this._events.slice(i, i + this.pageSize));
    }
    return pages;
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
    setTimeout(() => { this.isProgrammaticScroll = false; this.updateNavState(); }, 400);
  }

  private snapToNearestStart(): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;
    const cards = this.getCards(el);
    if (!cards.length) return;
    const left = el.scrollLeft;
    let nearest = cards[0], nearestDist = Infinity;
    for (const c of cards) {
      const dist = Math.abs(c.offsetLeft - left);
      if (dist < nearestDist) { nearestDist = dist; nearest = c; }
    }
    if (Math.abs(nearest.offsetLeft - left) > 5)
      el.scrollTo({ left: nearest.offsetLeft, behavior: 'smooth' });
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
    const viewLeft = el.scrollLeft, viewRight = viewLeft + el.clientWidth;
    const eps = 2;
    let left = -1, right = -1;
    for (let i = 0; i < cards.length; i++) {
      const cardLeft = cards[i].offsetLeft, cardRight = cardLeft + cards[i].offsetWidth;
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

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private toCardVm(e: EventResponseDto): EventCardVm {
    return {
                  id:              e.id,
                  title:           e.name,
                  venueName:       e.venueName ?? '',
                  venueAddress:    e.venueAddress ?? '',
                  locationName:    e.locationName ?? '',
                  locationAddress: e.locationAddress ?? '',
                  venueId:         e.venueId ?? null,
                  eventType:       e.eventType ?? null,
                  imageUrl:        e.imageUrl ?? '',
                  eventDateTime:   e.eventDateTime,
                  viewCount:       e.viewCount,
                  trending:        e.trending,
                  featured:        e.featured ?? false,
    };
  }

  private getFallbackImage(): string {
    return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7';
  }
}