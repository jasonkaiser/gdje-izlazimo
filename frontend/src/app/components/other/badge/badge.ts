import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

type Variant =
  | 'category'
  | 'success'
  | 'pending'
  | 'error'
  | 'highlight'
  | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.html',
  imports: [NgClass],
})
export class Badge {
  @Input() variant: Variant = 'category';

  get classes(): string {
    const base =
      'inline-flex items-center px-3 py-1 text-[11px] font-semibold ' +
      'rounded-xl border backdrop-blur-md';

    const variants: Record<Variant, string> = {

      // Venue category
      category:
        'text-[#FBBF24] bg-[#FBBF24]/15 border border-[#FBBF24]/40',

      success:
        'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40',

      pending:
        'text-[#FBBF24] bg-[#FBBF24]/15 border-[#FBBF24]/40',

      error:
        'text-[#EF4444] bg-[#EF4444]/15  border border-[#EF4444]/40',

      // VIP / Featured
      highlight:
        'text-black bg-[#FBBF24] border border-[#FBBF24]/60',

      // Neutral info
      neutral:
        'text-white/80 bg-white/5 border border-white/10',
    };

    return [base, variants[this.variant]].join(' ');
  }
}
