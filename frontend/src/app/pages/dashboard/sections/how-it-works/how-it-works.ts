import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type Step = {
  id: number;
  label: string;
  title: string;
  mainText: string;
  subText: string;
  icon: 'eye' | 'map' | 'reservation';
  side: 'left' | 'right';
};

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.html',
  styleUrls: ['./how-it-works.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksSectionComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);

  steps: Step[] = [
    {
      id: 1,
      label: 'Prvi Korak',
      title: 'Pronađi lokal',
      mainText: 'Upiši naziv ili filtriraj po tipu lokala.',
      subText: 'Pronađi najbolje pubove, klubove i restorane u Sarajevu.',
      icon: 'eye',
      side: 'right',
    },
    {
      id: 2,
      label: 'Drugi Korak',
      title: 'Istraži lokal',
      mainText: 'Pogledaj detalje, slike i dostupne termine.',
      subText: 'Provjeri atmosferu, lokaciju i opcije rezervacije.',
      icon: 'map',
      side: 'left',
    },
    {
      id: 3,
      label: 'Treći Korak',
      title: 'Rezerviši sto',
      mainText: 'Potvrdi rezervaciju u 3 klika.',
      subText: 'Rezerviši brzo — bez poziva i čekanja.',
      icon: 'reservation',
      side: 'right',
    },
  ];

  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;
  @ViewChild('section', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChildren('stepRow') stepRows!: QueryList<ElementRef<HTMLElement>>;

  activeIndex = signal(0);
  fillPct = signal(0);

  private stepCenters: number[] = [];
  private rafId = 0;
  private ro?: ResizeObserver;

  readonly fillStyle = computed(() => ({
    height: `${this.fillPct()}%`,
  }));

  ngAfterViewInit(): void {
    this.measure();

    this.ro = new ResizeObserver(() => this.measure());
    this.ro.observe(this.sectionRef.nativeElement);
    this.destroyRef.onDestroy(() => this.ro?.disconnect());

    const onScroll = () => this.scheduleUpdate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(this.rafId);
    });

    this.scheduleUpdate();
  }

  private scheduleUpdate(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.update());
  }

  private measure(): void {
    const trackEl = this.trackRef.nativeElement;
    const trackRect = trackEl.getBoundingClientRect();
    const trackTop = trackRect.top + window.scrollY;

    const rows = this.stepRows?.toArray() ?? [];
    this.stepCenters = rows.map((r) => {
      const rect = r.nativeElement.getBoundingClientRect();
      const centerY = rect.top + window.scrollY + rect.height / 2;
      return Math.max(0, centerY - trackTop);
    });

    this.scheduleUpdate();
  }

  private update(): void {
    const trackEl = this.trackRef.nativeElement;
    const trackRect = trackEl.getBoundingClientRect();

    const trackTop = trackRect.top + window.scrollY;
    const trackHeight = Math.max(1, trackRect.height);

    const progressY = window.scrollY + window.innerHeight * 0.45;

    const clamped = Math.min(trackHeight, Math.max(0, progressY - trackTop));
    this.fillPct.set((clamped / trackHeight) * 100);

    if (this.stepCenters.length) {
      const localY = clamped;
      let bestIdx = 0;
      let bestDist = Infinity;

      for (let i = 0; i < this.stepCenters.length; i++) {
        const d = Math.abs(this.stepCenters[i] - localY);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      this.activeIndex.set(bestIdx);
    }
  }

  isActive(i: number): boolean {
    return this.activeIndex() === i;
  }

  isActiveOrPassed(i: number): boolean {
    return i <= this.activeIndex();
  }
}
