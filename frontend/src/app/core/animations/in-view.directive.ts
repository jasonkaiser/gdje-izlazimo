import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({ selector: '[inView]', standalone: true })
export class InViewDirective implements AfterViewInit, OnDestroy {
  @Output() inViewChange = new EventEmitter<boolean>();

  private io?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver === 'undefined') return;

    this.io = new IntersectionObserver(
      ([entry]) => this.inViewChange.emit(entry.isIntersecting),
      {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    this.io.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.io?.disconnect();
  }
}