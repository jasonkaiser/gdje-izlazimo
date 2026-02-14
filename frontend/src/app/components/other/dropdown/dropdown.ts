import { Component, Input, forwardRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.html',
  styleUrls: ['./dropdown.css'],
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
  isClosing = false;

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    
    if (this.isOpen && !clickedInside) {
      this.closeDropdown();
    }
  }

  private closeDropdown(): void {
    this.isClosing = true;
    
    setTimeout(() => {
      this.isOpen = false;
      this.isClosing = false;
    }, 150); 
  }

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

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    
    if (!this.disabled) {
      if (this.isOpen) {
        this.closeDropdown();
      } else {
        this.isOpen = true;
        this.onTouched();
      }
    }
  }

  selectOption(optionValue: string | number, event: Event): void {
    event.stopPropagation();
    
    this.value = optionValue;
    this.onChange(optionValue);
    this.closeDropdown();
  }

  get selectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.value);
    return selected ? selected.label : this.placeholder;
  }
}