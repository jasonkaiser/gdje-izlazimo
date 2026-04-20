import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type RevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-in'
  | 'zoom-up'
  | 'slide-left'
  | 'slide-right';

const TRANSFORMS: Record<RevealVariant, string> = {
  'fade-up':    'translateY(64px)',
  'fade-down':  'translateY(-20px)',
  'fade-in':    'none',
  'zoom-up':    'translateY(24px) scale(0.97)',
  'slide-left': 'translateX(28px)',
  'slide-right':'translateX(-28px)',
};

@Directive({
  selector: '[scrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() srVariant: RevealVariant = 'fade-up';
  @Input() srDelay: number = 0;
  @Input() srDuration: number = 550;
  @Input() srThreshold: number = 0.1;
  @Input() srOnce: boolean = true;
  @Input() srDistance: number = 64;

  private observer!: IntersectionObserver;
  private el: HTMLElement;

  constructor(
    ref: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.el = ref.nativeElement;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.hide();

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.reveal();
          if (this.srOnce) this.observer.unobserve(this.el);
        } else if (!this.srOnce) {
          this.hide();
        }
      },
      {
        threshold: this.srThreshold,
        rootMargin: '0px 0px -48px 0px',
      }
    );

    this.observer.observe(this.el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

private hide(): void {
  const base = TRANSFORMS[this.srVariant];
  const transform = this.srVariant === 'fade-up'
    ? `translateY(${this.srDistance}px)`
    : this.srVariant === 'fade-down'
    ? `translateY(-${this.srDistance}px)`
    : base;

  this.el.style.opacity = '0';
  this.el.style.transform = transform === 'none' ? '' : transform;
  this.el.style.transition = 'none';
  void this.el.offsetHeight;
}

  private reveal(): void {
    this.el.style.transition = [
      `opacity ${this.srDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${this.srDelay}ms`,
      `transform ${this.srDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${this.srDelay}ms`,
    ].join(', ');

    requestAnimationFrame(() => {
      this.el.style.opacity = '1';
      this.el.style.transform = 'translateY(0) translateX(0) scale(1)';
    });
  }
}