import { Component, Input, forwardRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [NgClass],
  templateUrl: './dropdown.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppDropdown),
      multi: true,
    },
  ],
})
export class AppDropdown implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select...';
  @Input() error = '';
  @Input() options: Array<{ value: string | number; label: string }> = [];

  disabled = false;
  value: string | number | null = '';
  isOpen = false;

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

  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.onTouched();
      }
    }
  }

  selectOption(optionValue: string | number) {
    this.value = optionValue;
    this.onChange(optionValue);
    this.isOpen = false;
  }

  get selectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.value);
    return selected ? selected.label : this.placeholder;
  }

  get shellClasses(): string {
    const base =
      'relative w-full rounded-xl px-4 py-3 cursor-pointer ' +
      'bg-white/5 border backdrop-blur-md transition ' +
      'hover:border-white/20 ';

    const focus = this.isOpen 
      ? 'border-[#7C3AED]/55 shadow-[0_0_0_1px_rgba(124,58,237,0.25)]'
      : '';

    const border = this.error ? 'border-[#EF4444]/40' : 'border-white/10';
    const state = this.disabled ? 'opacity-50 pointer-events-none' : '';

    return [base, focus, border, state].join(' ');
  }
}