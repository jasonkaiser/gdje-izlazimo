import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

type NavLink = { name: string; href: string };
type SocialLink = { name: string; href: string; icon: 'linkedin' | 'instagram' | 'mail' | 'phone' };

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

  @ViewChild('footerEl', { static: true }) footerEl!: ElementRef<HTMLElement>;

  inView = signal(false);

  navigationLinks: NavLink[] = [
    { name: 'Pocetna', href: '/' },
    { name: 'Rezervacije', href: '/rezervacije' },
    { name: 'Lokali', href: '/lokali' },
    { name: 'Profil', href: '/profil' },
  ];

  socialLinks: SocialLink[] = [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
    { name: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram' },
    { name: 'Email', href: 'mailto:info@gdje-izlazimo.ba', icon: 'mail' },
    { name: 'Telefon', href: 'tel:+38760000000', icon: 'phone' },
  ];

  ngAfterViewInit(): void {
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
