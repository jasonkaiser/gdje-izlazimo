import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { AppInput } from '../../other/input/input';
import { AppDropdown } from '../../other/dropdown/dropdown';
import { CreateReservationRequest } from '../../../core/models/reservations/create-reservation.request';

type TableTypeVm = {
  id: string;
  tableTypeId: string;
  title: string;
  description: string;
  capacityLabel: string;
};

@Component({
  selector: 'app-reservation-modal',
  standalone: true,
  imports: [ReactiveFormsModule, AppInput, AppDropdown, ButtonComponent],
  templateUrl: './reservation-modal.html',
})
export class ReservationModal implements OnInit {
  @Input() venueName = 'Venue Name';
  @Input() venueTableTypes: TableTypeVm[] = [];
  @Input() venueId = '';

  @Output() close = new EventEmitter<void>();
  @Output() submitReservation = new EventEmitter<CreateReservationRequest>();

  peopleOptions = [2, 3, 4, 5, 6, 7, 8];

  get tableTypeSelectOptions() {
    return this.venueTableTypes.map(t => ({ value: t.tableTypeId, label: t.title }));
  }

  get peopleSelectOptions() {
    return this.peopleOptions.map(n => ({ value: String(n), label: String(n) }));
  }

  form;
  
  ngOnInit(): void {
    
  }
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


  onClose() {
    this.close.emit();
  }

  onSubmit() {

    console.log('VALID?', this.form.valid, 'STATUS', this.form.status);

    console.log('VALUE', this.form.getRawValue());

    console.log('ERRORS', this.form.errors)

    console.log('tableTypeId', this.form.controls.tableTypeId.value, this.form.controls.tableTypeId.errors);

    console.log('numberOfPeople', this.form.controls.numberOfPeople.value, this.form.controls.numberOfPeople.errors);

    console.log('date', this.form.controls.reservationDate.value, this.form.controls.reservationDate.errors);

        console.log('time', this.form.controls.reservationTime.value, this.form.controls.reservationTime.errors);


    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      numberOfPeople: Number(raw.numberOfPeople),
      venueId : this.venueId
    };

    this.submitReservation.emit(payload);
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