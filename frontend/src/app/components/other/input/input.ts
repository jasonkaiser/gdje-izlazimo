import { Component, Input, forwardRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type Kind = 'input' | 'select' | 'textarea';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NgClass],
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInput),
      multi: true,
    },
  ],
})
export class AppInput implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() kind: Kind = 'input';

  @Input() type: string = 'text';

  @Input() options: Array<{ value: string | number; label: string }> = [];
  @Input() selectPlaceholder = 'Select...';

  disabled = false;
  value: string | number | null = '';

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: any): void {
    this.value = v ?? '';
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(v: string) {
    this.value = v;
    this.onChange(v);
  }

  handleSelect(v: string) {
    this.value = v;
    this.onChange(v);
  }

  markTouched() {
    this.onTouched();
  }

  get shellClasses(): string {
    const base =
      'relative w-full rounded-xl px-4 py-3 ' +
      'bg-white/5 border transition ' +
      'focus-within:border-[#7C3AED]/55 ' +
      'focus-within:shadow-[0_0_0_1px_rgba(124,58,237,0.25)]';

    const border = this.error ? 'border-[#EF4444]/40' : 'border-white/10';
    const state = this.disabled ? 'opacity-50 pointer-events-none' : '';

    return [base, border, state].join(' ');
  }

  get controlBase(): string {
    return 'w-full bg-transparent outline-none text-white text-[14px] placeholder:text-white/35';
  }
}