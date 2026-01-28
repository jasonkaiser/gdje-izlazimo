import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

type Variant = 'success' | 'error' | 'warning';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.html',
})
export class Toast {
  @Input() variant: Variant = 'success';

  get wrapperClasses(): string {
    const base =
      'flex items-start gap-3 rounded-2xl px-4 py-3 ' +
      'min-w-[300px] max-w-[420px] ' +
      'bg-[#FFFFFF]/3 backdrop-blur-xl text-white ' +
      'border shadow-[0_24px_70px_-28px_rgba(0,0,0,0.85)]';

    const borders: Record<Variant, string> = {
      success:
        'border-[#10B981]/35 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_24px_70px_-28px_rgba(0,0,0,0.85)]',
      error:
        'border-[#EF4444]/35 shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_24px_70px_-28px_rgba(0,0,0,0.85)]',
      warning:
        'border-[#FBBF24]/35 shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_24px_70px_-28px_rgba(0,0,0,0.85)]',
    };

    return [base, borders[this.variant]].join(' ');
  }

  get iconClasses(): string {
    const map: Record<Variant, string> = {
      success:
        'bg-[#10B981]/18 text-[#10B981] border border-[#10B981]/35',
      error:
        'bg-[#EF4444]/18 text-[#EF4444] border border-[#EF4444]/35',
      warning:
        'bg-[#FBBF24]/18 text-[#FBBF24] border border-[#FBBF24]/35',
    };

    return (
      'shrink-0 w-10 h-10 rounded-xl grid place-items-center ' +
      'backdrop-blur-md leading-none text-[16px] ' +
      map[this.variant]
    );
  }

  get icon(): string {
    return this.variant === 'success' ? '✓' : '!';
  }
}
