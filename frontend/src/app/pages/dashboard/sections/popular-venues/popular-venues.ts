import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { VenueCard } from '../../../../components/cards/venue-card/venue-card';

@Component({
  selector: 'app-popular-venues',
  standalone: true,
  imports: [VenueCard],
  templateUrl: './popular-venues.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularVenuesCarouselComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) venues: any[] = [];
  @Input() title = '';
  @Input() subtitle = '';

  @ViewChild('scroller') scroller?: ElementRef<HTMLDivElement>;

  canPrev = false;
  canNext = false;

  private scrollEndTimer: any;
  private isProgrammaticScroll = false;
  private isDesktop = false;
  private peekIndexRight = -1;
  private peekIndexLeft = -1;
  private ro?: ResizeObserver;

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngAfterViewInit() {
    this.updateIsDesktop();

    const el = this.scroller?.nativeElement;
    if (!el) return;

    setTimeout(() => {
      this.updateNavState();
      this.cdr.detectChanges();
    }, 0);
    
    setTimeout(() => {
      this.updateNavState();
      this.cdr.detectChanges();
    }, 250);

    this.zone.runOutsideAngular(() => {
      this.ro = new ResizeObserver(() => {
        this.zone.run(() => {
          this.updateIsDesktop();
          this.updateNavState();
        });
      });
      this.ro!.observe(el);

      el.querySelectorAll('img').forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', this.onImgLoad, { passive: true });
      });

      window.addEventListener('resize', this.onResize, { passive: true });
    });
  }

  ngOnDestroy() {
    clearTimeout(this.scrollEndTimer);
    this.ro?.disconnect();
    window.removeEventListener('resize', this.onResize);

    const el = this.scroller?.nativeElement;
    if (!el) return;
    el.querySelectorAll('img').forEach((img) => {
      img.removeEventListener('load', this.onImgLoad as any);
    });
  }

  private onResize = () => {
    this.zone.run(() => {
      this.updateIsDesktop();
      this.updateNavState();
    });
  };

  private onImgLoad = () => {
    this.zone.run(() => {
      this.updateNavState();
    });
  };

  private updateIsDesktop() {
    this.isDesktop = window.matchMedia('(min-width: 640px)').matches;
  }

  onScroll() {
    this.updateNavState();

    if (!this.isDesktop) return;
    if (this.isProgrammaticScroll) return;

    clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = setTimeout(() => {
      this.zone.run(() => {
        this.snapToNearestStart();
      });
    }, 90);
  }

  scrollPrev() {
    console.log('scrollPrev clicked');
    this.scrollByCard(-1);
  }

  scrollNext() {
    console.log('scrollNext clicked');
    this.scrollByCard(1);
  }

  private scrollByCard(dir: -1 | 1) {
    const el = this.scroller?.nativeElement;
    if (!el) {
      console.log('No scroller element');
      return;
    }

    console.log('Scrolling by card:', dir);
    this.isProgrammaticScroll = true;
    clearTimeout(this.scrollEndTimer);

    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'));
    if (!cards.length) {
      console.log('No cards found');
      return;
    }

    const currentScroll = el.scrollLeft;
    const gap = this.getGap(el);
    
    let targetIndex = 0;
    for (let i = 0; i < cards.length; i++) {
      const cardLeft = cards[i].offsetLeft;
      if (cardLeft <= currentScroll + 10) {
        targetIndex = i;
      }
    }

    console.log('Current index:', targetIndex, 'Moving to:', targetIndex + dir);

    const newIndex = Math.max(0, Math.min(cards.length - 1, targetIndex + dir));
    const targetCard = cards[newIndex];
    
    if (targetCard) {
      console.log('Scrolling to:', targetCard.offsetLeft);
      el.scrollTo({ left: targetCard.offsetLeft, behavior: 'smooth' });
    }

    setTimeout(() => {
      this.isProgrammaticScroll = false;
      this.updateNavState();
    }, 400);
  }

  private snapToNearestStart() {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'));
    if (!cards.length) return;

    const left = el.scrollLeft;

    let nearest = cards[0];
    let nearestDist = Infinity;

    for (const c of cards) {
      const dist = Math.abs(c.offsetLeft - left);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = c;
      }
    }

    if (Math.abs(nearest.offsetLeft - left) > 5) {
      el.scrollTo({ left: nearest.offsetLeft, behavior: 'smooth' });
    }
  }

  private updateNavState() {
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

    if (this.isDesktop) {
      this.computePeekIndices();
    } else {
      this.peekIndexLeft = -1;
      this.peekIndexRight = -1;
    }
  }

  private computePeekIndices() {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'));
    if (!cards.length) return;

    const viewLeft = el.scrollLeft;
    const viewRight = viewLeft + el.clientWidth;
    const eps = 2;

    let peekLeft = -1;
    let peekRight = -1;

    for (let i = 0; i < cards.length; i++) {
      const cardLeft = cards[i].offsetLeft;
      const cardRight = cardLeft + cards[i].offsetWidth;


      const isCutOnLeft = cardLeft < viewLeft - eps;
      const isVisibleOnRight = cardRight > viewLeft + eps;
      
      if (isCutOnLeft && isVisibleOnRight && viewLeft > eps) {
        peekLeft = i;
      }

      const isVisibleOnLeft = cardLeft < viewRight - eps;
      const isCutOnRight = cardRight > viewRight + eps;

      if (isVisibleOnLeft && isCutOnRight) {
        peekRight = i;
      }
    }

    if (this.peekIndexLeft !== peekLeft || this.peekIndexRight !== peekRight) {
      this.peekIndexLeft = peekLeft;
      this.peekIndexRight = peekRight;
      this.cdr.markForCheck();
    }
  }

  isPeekDesktopLeftOrRight(i: number) {
    return this.isDesktop && (i === this.peekIndexLeft || i === this.peekIndexRight);
  }

  private getGap(el: HTMLElement) {
    const s = getComputedStyle(el);
    const g = parseFloat(s.gap || s.columnGap || '0');
    return Number.isFinite(g) ? g : 0;
  }
}