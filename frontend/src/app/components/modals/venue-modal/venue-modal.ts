import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../core/services/modal';
import { AppDropdown } from '../../other/dropdown/dropdown';
import { VenueService } from '../../../core/api/venue-service';
import { UserService } from '../../../core/api/user-service';
import { VenueCategory } from '../../../core/models/venues/venue-category.enum';
import { VenueResponseDto } from '../../../core/models/venues/venue-response.dto';
import { CreateVenueRequest } from '../../../core/models/venues/create-venue.request';
import { UpdateVenueRequest } from '../../../core/models/venues/update-venue.request';
import { UserResponseDto } from '../../../core/models/users/user-response.dto';
import { Role } from '../../../core/models/users/user-role.enum';
import { DayOfWeek } from '../../../core/models/venue-operating-hours/day-of-week.enum';
import { take, switchMap } from 'rxjs/operators';
import { ToastService } from '../../../core/ui/toast';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VenueOperatingHoursService } from '../../../core/api/venue-operating-hours-service';
import { AuthService } from '../../../core/auth/auth.service';


interface VenueModalData {
  mode: 'create' | 'edit';
  venue?: VenueResponseDto;
}

interface HoursSlot {
  id: string | null;   
  startDay: DayOfWeek;
  endDay: DayOfWeek;
  openTime: string;
  closedTime: string;
  isSaving: boolean;
  isDeleting: boolean;
}

type ModalTab = 'details' | 'hours';

@Component({
  selector: 'app-venue-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppDropdown],
  templateUrl: './venue-modal.html',
  styleUrls: ['./venue-modal.css']
})
export class VenueModalComponent implements OnInit {
  @Input() data!: VenueModalData;

  private readonly modalService  = inject(ModalService);
  private readonly venueService  = inject(VenueService);
  private readonly userService   = inject(UserService);
  private readonly hoursService  = inject(VenueOperatingHoursService);
  private readonly toastService  = inject(ToastService);
  private readonly authService   = inject(AuthService);

  mode: 'create' | 'edit' = 'create';
  venueId: string | null = null;

  isSubmitting    = false;
  isLoadingOwners = false;
  isLoadingHours  = false;

  activeTab: ModalTab = 'details';

  venueOwners: UserResponseDto[] = [];

  /** The single operating-hours slot. Always exactly 0 or 1 items. */
  hoursSlot: HoursSlot | null = null;

  // ── Expose enums to template ────────────────────────────────────────
  readonly VenueCategory = VenueCategory;
  readonly DayOfWeek     = DayOfWeek;

  readonly allDays: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];

  readonly dayLabels: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]:    'Ponedjeljak',
    [DayOfWeek.TUESDAY]:   'Utorak',
    [DayOfWeek.WEDNESDAY]: 'Srijeda',
    [DayOfWeek.THURSDAY]:  'Četvrtak',
    [DayOfWeek.FRIDAY]:    'Petak',
    [DayOfWeek.SATURDAY]:  'Subota',
    [DayOfWeek.SUNDAY]:    'Nedjelja',
  };

  readonly dayLabelsShort: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]:    'Pon',
    [DayOfWeek.TUESDAY]:   'Uto',
    [DayOfWeek.WEDNESDAY]: 'Sri',
    [DayOfWeek.THURSDAY]:  'Čet',
    [DayOfWeek.FRIDAY]:    'Pet',
    [DayOfWeek.SATURDAY]:  'Sub',
    [DayOfWeek.SUNDAY]:    'Ned',
  };

  // ── Dropdown option arrays ───────────────────────────────────────────

  readonly venueTypeOptions = [
    { value: VenueCategory.CLUB,       label: 'Klub' },
    { value: VenueCategory.PUB,        label: 'Pub' },
    { value: VenueCategory.LOUNGE,     label: 'Lounge' },
    { value: VenueCategory.RESTAURANT, label: 'Restoran' },
  ];

  readonly dayOptions = [
    { value: DayOfWeek.MONDAY,    label: 'Ponedjeljak' },
    { value: DayOfWeek.TUESDAY,   label: 'Utorak' },
    { value: DayOfWeek.WEDNESDAY, label: 'Srijeda' },
    { value: DayOfWeek.THURSDAY,  label: 'Četvrtak' },
    { value: DayOfWeek.FRIDAY,    label: 'Petak' },
    { value: DayOfWeek.SATURDAY,  label: 'Subota' },
    { value: DayOfWeek.SUNDAY,    label: 'Nedjelja' },
  ];

  get venueOwnerOptions(): Array<{ value: string; label: string }> {
    return this.venueOwners.map(o => ({ value: o.id, label: `${o.name} (${o.email})` }));
  }

  formData = {
    name:         '',
    description:  '',
    addressName:  '',
    phone:        '',
    venueType:    VenueCategory.CLUB,
    isActive:     true,
    latitude:     43.8563,
    longitude:    18.4131,
    venueOwnerId: ''
  };


  get isAdmin(): boolean {
    return this.authService.hasRole(Role.ADMIN);
  }


  get showInlineHours(): boolean {
    return this.mode === 'create' && this.isAdmin;
  }

  ngOnInit(): void {
    this.mode = this.data.mode;

    console.log('[VenueModal] roles:', this.authService.getRoles(), '| isAdmin:', this.isAdmin);

    if (this.mode === 'edit' && this.data.venue) {
      this.venueId = this.data.venue.id;
      this.formData = {
        name:         this.data.venue.name,
        description:  this.data.venue.description || '',
        addressName:  this.data.venue.addressName,
        phone:        this.data.venue.phone,
        venueType:    this.data.venue.venueType,
        isActive:     this.data.venue.isActive,
        latitude:     this.data.venue.latitude,
        longitude:    this.data.venue.longitude,
        venueOwnerId: ''
      };
      this.loadOperatingHours();
    } else if (this.mode === 'create') {
      this.loadVenueOwners();
      this.hoursSlot = this.buildDefaultSlot();
    }
  }


  setTab(tab: ModalTab): void {
    this.activeTab = tab;
  }


  loadVenueOwners(): void {
    this.isLoadingOwners = true;
    this.userService.getUsers({ role: Role.VENUE_OWNER, pageSize: 1000 })
      .pipe(take(1))
      .subscribe({
        next: owners => { this.venueOwners = owners; this.isLoadingOwners = false; },
        error: err => {
          console.error('[VenueModal] Failed to load owners:', err);
          this.toastService.show('Greška pri učitavanju vlasnika lokala', 'error');
          this.isLoadingOwners = false;
        }
      });
  }


  loadOperatingHours(): void {
    if (!this.venueId) return;
    this.isLoadingHours = true;

    this.hoursService.getByVenueId(this.venueId)
      .pipe(
        take(1),
        catchError((err: any) => {
          this.isLoadingHours = false;
          if (err?.status === 404) {
            return of(null);
          }
          console.error('[VenueModal] Failed to load operating hours:', err);
          this.toastService.show('Greška pri učitavanju radnog vremena', 'error');
          return of(null);
        })
      )
      .subscribe(hours => {
        this.isLoadingHours = false;

        console.log('[VenueModal] getByVenueId response:', hours);

        if (hours && hours.id) {
          this.hoursSlot = {
            id:         hours.id,
            startDay:   hours.startDay,
            endDay:     hours.endDay,
            openTime:   hours.openTime.substring(0, 5),
            closedTime: hours.closedTime.substring(0, 5),
            isSaving:   false,
            isDeleting: false,
          };
        } else {
          this.hoursSlot = this.buildDefaultSlot();
        }
      });
  }

  saveHoursSlot(): void {
    if (!this.venueId || !this.hoursSlot) return;
    const slot = this.hoursSlot;

    if (!slot.openTime || !slot.closedTime) {
      this.toastService.show('Unesite vrijeme otvaranja i zatvaranja', 'error');
      return;
    }

    slot.isSaving = true;

    if (slot.id) {
      this.hoursService.updateVenueOperatingHours(slot.id, {
        startDay:   slot.startDay,
        endDay:     slot.endDay,
        openTime:   slot.openTime,
        closedTime: slot.closedTime,
      }).pipe(take(1)).subscribe({
        next: updated => {
          slot.id       = updated.id;
          slot.isSaving = false;
          this.toastService.show('Radno vrijeme ažurirano', 'success');
        },
        error: err => {
          console.error('[VenueModal] Failed to update hours:', err);
          this.toastService.show('Greška pri ažuriranju radnog vremena', 'error');
          slot.isSaving = false;
        }
      });
    } else {
      this.hoursService.createVenueOperatingHours({
        venueId:    this.venueId,
        startDay:   slot.startDay,
        endDay:     slot.endDay,
        openTime:   slot.openTime,
        closedTime: slot.closedTime,
      }).pipe(take(1)).subscribe({
        next: created => {
          slot.id       = created.id;
          slot.isSaving = false;
          this.toastService.show('Radno vrijeme sačuvano', 'success');
        },
        error: err => {
          console.error('[VenueModal] Failed to create hours:', err);
          this.toastService.show('Greška pri kreiranju radnog vremena', 'error');
          slot.isSaving = false;
        }
      });
    }
  }

  formatDayRange(slot: HoursSlot): string {
    if (slot.startDay === slot.endDay) return this.dayLabels[slot.startDay];
    return `${this.dayLabelsShort[slot.startDay]} – ${this.dayLabelsShort[slot.endDay]}`;
  }


  onClose(): void {
    this.modalService.close();
  }

  onSubmit(): void {
    if (!this.formData.name.trim()) {
      this.toastService.show('Naziv je obavezan', 'error'); return;
    }
    if (!this.formData.addressName.trim()) {
      this.toastService.show('Adresa je obavezna', 'error'); return;
    }
    if (!this.formData.phone.trim()) {
      this.toastService.show('Telefon je obavezan', 'error'); return;
    }
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(this.formData.phone)) {
      this.toastService.show('Neispravan format telefona', 'error'); return;
    }
    if (this.mode === 'create' && !this.formData.venueOwnerId) {
      this.toastService.show('Vlasnik lokala je obavezan', 'error'); return;
    }

    this.isSubmitting = true;
    if (this.mode === 'edit' && this.venueId) {
      this.updateVenue();
    } else {
      this.createVenue();
    }
  }

  private createVenue(): void {
    const request: CreateVenueRequest = {
      name:         this.formData.name.trim(),
      description:  this.formData.description.trim() || undefined,
      addressName:  this.formData.addressName.trim(),
      phone:        this.formData.phone.trim(),
      venueType:    this.formData.venueType,
      isActive:     this.formData.isActive,
      latitude:     this.formData.latitude,
      longitude:    this.formData.longitude,
      venueOwnerId: this.formData.venueOwnerId
    };

    this.venueService.createVenue(request)
      .pipe(
        take(1),
        switchMap(createdVenue => {
          const slot = this.hoursSlot;
          if (this.isAdmin && slot && slot.openTime && slot.closedTime) {
            return this.hoursService.createVenueOperatingHours({
              venueId:    createdVenue.id,
              startDay:   slot.startDay,
              endDay:     slot.endDay,
              openTime:   slot.openTime,
              closedTime: slot.closedTime,
            }).pipe(
              catchError(err => {
                console.error('[VenueModal] Venue created but failed to save hours:', err);
                this.toastService.show('Lokal kreiran, ali radno vrijeme nije sačuvano', 'error');
                return of(null);
              })
            );
          }
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.toastService.show('Lokal uspješno kreiran', 'success');
          this.modalService.close();
          window.dispatchEvent(new CustomEvent('venue-updated'));
        },
        error: err => {
          console.error('[VenueModal] Failed to create venue:', err);
          this.toastService.show('Greška pri kreiranju lokala', 'error');
          this.isSubmitting = false;
        }
      });
  }

  private updateVenue(): void {
    if (!this.venueId) return;

    const request: UpdateVenueRequest = {
      name:        this.formData.name.trim(),
      description: this.formData.description.trim() || undefined,
      addressName: this.formData.addressName.trim(),
      venueType:   this.formData.venueType,
      phone:       this.formData.phone.trim(),
      isActive:    this.formData.isActive
    };

    this.venueService.updateVenue(request, this.venueId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.show('Lokal uspješno ažuriran', 'success');
          this.modalService.close();
          window.dispatchEvent(new CustomEvent('venue-updated'));
        },
        error: err => {
          console.error('[VenueModal] Failed to update venue:', err);
          this.toastService.show('Greška pri ažuriranju lokala', 'error');
          this.isSubmitting = false;
        }
      });
  }

  getCategoryLabel(category: VenueCategory): string {
    const labels: Record<VenueCategory, string> = {
      [VenueCategory.CLUB]:       'Klub',
      [VenueCategory.PUB]:        'Pub',
      [VenueCategory.LOUNGE]:     'Lounge',
      [VenueCategory.RESTAURANT]: 'Restoran'
    };
    return labels[category];
  }

  get canSaveDetails(): boolean {
    return !!this.formData.name.trim() &&
           !!this.formData.addressName.trim() &&
           !!this.formData.phone.trim() &&
           (this.mode === 'edit' || !!this.formData.venueOwnerId);
  }


  private buildDefaultSlot(): HoursSlot {
    return {
      id:         null,
      startDay:   DayOfWeek.MONDAY,
      endDay:     DayOfWeek.SUNDAY,
      openTime:   '09:00',
      closedTime: '23:00',
      isSaving:   false,
      isDeleting: false,
    };
  }
}