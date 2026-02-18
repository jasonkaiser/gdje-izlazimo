import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { AppInput } from '../../other/input/input';
import { AppDropdown } from '../../other/dropdown/dropdown';
import { CreateReservationRequest } from '../../../core/models/reservations/create-reservation.request';
import { InViewDirective } from '../../../core/animations/in-view.directive';
import { ElementRef, ViewChild } from '@angular/core';



type TableTypeVm = {
  id: string;
  tableTypeId: string;
  title: string;
  description: string;
  capacityLabel: string;
};

type InViewKey = 'table' | 'people' | 'phone' | 'dateTime' | 'note' | 'footer';

type InViewState = {
  table: boolean;
  people: boolean;
  phone: boolean;
  dateTime: boolean;
  note: boolean;
  footer: boolean;
};

@Component({
  selector: 'app-reservation-modal',
  standalone: true,
  imports: [ReactiveFormsModule, AppInput, AppDropdown, ButtonComponent, InViewDirective],
  templateUrl: './reservation-modal.html',
  styleUrl: './reservation-modal.css',
})
export class ReservationModal {
  @Input() venueName = 'Venue Name';
  @Input() venueTableTypes: TableTypeVm[] = [];
  @Input() venueId = '';

  @Output() close = new EventEmitter<void>();
  @Output() submitReservation = new EventEmitter<CreateReservationRequest>();

  @ViewChild('dateInput', { read: ElementRef }) dateInputHost?: ElementRef<HTMLElement>;
  @ViewChild('timeInput', { read: ElementRef }) timeInputHost?: ElementRef<HTMLElement>;

  peopleOptions = [2, 3, 4, 5, 6, 7, 8];

  inView: InViewState = {
    table: false,
    people: false,
    phone: false,
    dateTime: false,
    note: false,
    footer: false,
  };

  isClosing = false;

  form;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      tableTypeId: this.fb.nonNullable.control<string | ''>('', Validators.required),
      numberOfPeople: this.fb.nonNullable.control<string>('', Validators.required),
      reservationTime: this.fb.nonNullable.control<string>('', Validators.required),
      reservationDate: this.fb.nonNullable.control<string>('', Validators.required),
      specialRequests: this.fb.nonNullable.control<string>(''),
      phone: this.fb.nonNullable.control<string>('', Validators.required),
    });
  }

  get tableTypeSelectOptions() {
    return this.venueTableTypes.map((t) => ({ value: t.tableTypeId, label: t.title }));
  }

  get peopleSelectOptions() {
    return this.peopleOptions.map((n) => ({ value: String(n), label: String(n) }));
  }

  setInView(key: InViewKey, visible: boolean) {
    if (visible) this.inView[key] = true; 
  }

  onClose() {
    if (this.isClosing) return;
    this.isClosing = true;
    setTimeout(() => this.close.emit(), 180);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.submitReservation.emit({
      ...raw,
      numberOfPeople: Number(raw.numberOfPeople),
      venueId: this.venueId,
    });
  }

    private openNativePicker(host?: ElementRef<HTMLElement>) {
      const root = host?.nativeElement;
      if (!root) return;

      const input = root.querySelector('input') as HTMLInputElement | null;
      if (!input) return;

      if (typeof (input as any).showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    }

    openDatePicker() {
      this.openNativePicker(this.dateInputHost);
    }

    openTimePicker() {
      this.openNativePicker(this.timeInputHost);
    }

  get tableTypeError() {
    const c = this.form.controls.tableTypeId;
    return c.touched && c.invalid ? 'Odaberi vrstu stola.' : '';
  }

  get peopleCountError() {
    const c = this.form.controls.numberOfPeople;
    return c.touched && c.invalid ? 'Odaberi broj ljudi.' : '';
  }

  get dateError() {
    const c = this.form.controls.reservationDate;
    return c.touched && c.invalid ? 'Odaberi datum.' : '';
  }

  get timeError() {
    const c = this.form.controls.reservationTime;
    return c.touched && c.invalid ? 'Odaberi vrijeme.' : '';
  }
}
