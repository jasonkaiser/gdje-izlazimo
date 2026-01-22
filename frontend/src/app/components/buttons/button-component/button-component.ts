import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

type Variant =  'outline' | 'filled' | 'special';
type Size = 'sm' | 'md'

@Component({
  selector: 'app-button-component',
  imports: [NgClass],
  templateUrl: './button-component.html',
  styleUrl: './button-component.css',
})
export class ButtonComponent {

    @Input() variant: Variant = 'outline';
    @Input() size: Size = 'sm';

    get classes() : string {

      const base =
        'inline-flex items-center justify-center rounded-xl font-semibold ' +
        'transition-all duration-200 select-none ' +
        'focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ' +
        'disabled:opacity-50 disabled:cursor-not-allowed';

      const sizes: Record<Size, string> = {

        sm: 'text-[12px] px-4 py-2',
        md: 'text-[13px] px-5 py-2.5'

      };

    const variants: Record<Variant, string> = {
        outline:
          'text-white border border-[#7C3AED]/50 bg-[#7C3AED]/40 backdrop-blur-md ' +
          'hover:bg-[#7C3AED]/60 hover:border-[#7C3AED]/80 ' +
          'hover:shadow-[0_0_22px_-8px_rgba(124,58,237,0.65)]',

        filled:
          'text-white bg-[#7C3AED] ' +
          'hover:bg-[#6D28D9] ' +
          'hover:shadow-[0_0_26px_-8px_rgba(124,58,237,0.75)]',

        special:
          'text-black bg-[#FBBF24] ' +
          'hover:bg-[#F59E0B] ' +
          'hover:shadow-[0_0_22px_-10px_rgba(251,191,36,0.75)]',
      };

      return [base, sizes[this.size], variants[this.variant]].join(' ');


    }

}
