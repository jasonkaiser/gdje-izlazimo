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

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta.html',
  styleUrls: ['./cta.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);

  @ViewChild('ctaEl', { static: true }) ctaEl!: ElementRef<HTMLElement>;

  inView = signal(false);

  ngAfterViewInit(): void {
    const el = this.ctaEl.nativeElement;

    if (typeof IntersectionObserver === 'undefined') {
      this.inView.set(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.inView.set(true);
          io.disconnect(); 
        }
      },
      { root: null, threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    requestAnimationFrame(() => io.observe(el));

    this.destroyRef.onDestroy(() => io.disconnect());
  }
}
