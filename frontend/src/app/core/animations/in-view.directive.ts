import { Directive, ElementRef, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({ selector: '[inView]', standalone: true })
export class InViewDirective implements AfterViewInit, OnDestroy {
  @Output() inViewChange = new EventEmitter<boolean>();

  private io?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
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
