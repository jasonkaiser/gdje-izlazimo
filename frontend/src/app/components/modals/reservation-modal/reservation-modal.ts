import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { AppInput } from '../../other/input/input';
import { AppDropdown } from '../../other/dropdown/dropdown';

type TableType = 'Standard' | 'High Table' | 'Booth' | 'VIP';

@Component({
  selector: 'app-reservation-modal',
  standalone: true,
  imports: [ReactiveFormsModule, AppInput, AppDropdown, ButtonComponent],
  templateUrl: './reservation-modal.html',
})
export class ReservationModal implements OnInit {
  @Input() open = true;
  @Input() venueName = 'Venue Name';
  @Output() close = new EventEmitter<void>();

  tableTypes: TableType[] = ['Standard', 'High Table', 'Booth', 'VIP'];
  peopleOptions = [2, 3, 4, 5, 6, 7, 8];

  get tableTypeSelectOptions() {
    return this.tableTypes.map(t => ({ value: t, label: t }));
  }

  get peopleSelectOptions() {
    return this.peopleOptions.map(n => ({ value: String(n), label: String(n) }));
  }

  form;

  constructor(private fb: FormBuilder) {
    console.log('ReservationModal constructor called!', this.open);
    this.form = this.fb.group({
      tableType: this.fb.control<TableType | ''>('', Validators.required),
      peopleCount: this.fb.control<string>('', Validators.required), 
      dateTime: this.fb.control<string>('', Validators.required),
      specialRequests: this.fb.control<string>(''),
    });
  }

  ngOnInit() {
    console.log('ReservationModal ngOnInit, open =', this.open);
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      peopleCount: Number(raw.peopleCount),
    };

    console.log(payload);
  }

  get tableTypeError() {
    const c = this.form.controls.tableType;
    return c.touched && c.invalid ? 'Odaberi vrstu stola.' : '';
  }
  get peopleCountError() {
    const c = this.form.controls.peopleCount;
    return c.touched && c.invalid ? 'Odaberi broj ljudi.' : '';
  }
  get dateTimeError() {
    const c = this.form.controls.dateTime;
    return c.touched && c.invalid ? 'Odaberi datum i vrijeme.' : '';
  }
}