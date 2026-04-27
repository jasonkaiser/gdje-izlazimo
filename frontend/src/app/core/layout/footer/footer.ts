import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
  Inject,
  PLATFORM_ID,
} from '@angular/core';

type NavLink = { name: string; href: string };

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFooterComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  @ViewChild('footerEl', { static: true }) footerEl!: ElementRef<HTMLElement>;

  inView = signal(false);

  navigationLinks: NavLink[] = [
    { name: 'Pocetna', href: '/' },
    { name: 'Rezervacije', href: '/reservations' },
    { name: 'Lokali', href: '/venues' },
    { name: 'Profil', href: '/profile' },
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const el = this.footerEl.nativeElement;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) this.inView.set(true);
      },
      { root: null, threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    io.observe(el);

    this.destroyRef.onDestroy(() => {
      io.disconnect();
    });
  }

  trackByName(_: number, item: { name: string }): string {
    return item.name;
  }
}