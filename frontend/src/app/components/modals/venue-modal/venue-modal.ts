import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
import { VenueImageService } from '../../../core/api/venue-image-service';
import { VenueImageResponseDto } from '../../../core/models/venue-images/venue-image-response';

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

type ModalTab = 'details' | 'hours' | 'images';

@Component({
  selector: 'app-venue-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppDropdown],
  templateUrl: './venue-modal.html',
  styleUrls: ['./venue-modal.css']
})
export class VenueModalComponent implements OnInit {
  @Input() data!: VenueModalData;

  private readonly modalService      = inject(ModalService);
  private readonly venueService      = inject(VenueService);
  private readonly userService       = inject(UserService);
  private readonly hoursService      = inject(VenueOperatingHoursService);
  private readonly toastService      = inject(ToastService);
  private readonly authService       = inject(AuthService);
  private readonly venueImageService = inject(VenueImageService);
  private readonly cdr               = inject(ChangeDetectorRef);

  images: VenueImageResponseDto[]  = [];
  isLoadingImages                  = false;
  isUploadingImage                 = false;
  uploadError                      = '';
  selectedFile: File | null        = null;
  selectedFilePreview: string|null = null;
  uploadIsPrimary                  = false;
  deletingImageId: string | null   = null;
  settingPrimaryId: string | null  = null;

  mode: 'create' | 'edit' = 'create';
  venueId: string | null  = null;
  isSubmitting            = false;
  isLoadingOwners         = false;
  isLoadingHours          = false;
  activeTab: ModalTab     = 'details';
  venueOwners: UserResponseDto[] = [];
  hoursSlot: HoursSlot | null    = null;

  readonly VenueCategory = VenueCategory;
  readonly DayOfWeek     = DayOfWeek;

  readonly allDays: DayOfWeek[] = [
    DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY,
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

  get canSaveDetails(): boolean {
    return !!this.formData.name.trim() &&
           !!this.formData.addressName.trim() &&
           !!this.formData.phone.trim() &&
           (this.mode === 'edit' || !!this.formData.venueOwnerId);
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
      this.loadImages();
    } else if (this.mode === 'create') {
      this.loadVenueOwners();
      this.hoursSlot = this.buildDefaultSlot();
    }
  }


  setTab(tab: ModalTab): void {
    this.activeTab = tab;
    if (tab === 'images' && this.venueId && this.images.length === 0 && !this.isLoadingImages) {
      this.loadImages();
    }
  }


  loadVenueOwners(): void {
    this.isLoadingOwners = true;
    this.userService.getUsers({ role: Role.VENUE_OWNER, pageSize: 1000 })
      .pipe(take(1))
      .subscribe({
        next: owners => {
          this.venueOwners = owners;
          this.isLoadingOwners = false;
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('[VenueModal] Failed to load owners:', err);
          this.toastService.show('Greška pri učitavanju vlasnika lokala', 'error');
          this.isLoadingOwners = false;
          this.cdr.markForCheck();
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
          if (err?.status === 404) return of(null);
          console.error('[VenueModal] Failed to load operating hours:', err);
          this.toastService.show('Greška pri učitavanju radnog vremena', 'error');
          return of(null);
        })
      )
      .subscribe(hours => {
        this.isLoadingHours = false;
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
        this.cdr.markForCheck();
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
    this.cdr.markForCheck();

    if (slot.id) {
      this.hoursService.updateVenueOperatingHours(slot.id, {
        startDay: slot.startDay, endDay: slot.endDay,
        openTime: slot.openTime, closedTime: slot.closedTime,
      }).pipe(take(1)).subscribe({
        next: updated => {
          slot.id = updated.id;
          slot.isSaving = false;
          this.toastService.show('Radno vrijeme ažurirano', 'success');
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('[VenueModal] Failed to update hours:', err);
          this.toastService.show('Greška pri ažuriranju radnog vremena', 'error');
          slot.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.hoursService.createVenueOperatingHours({
        venueId: this.venueId, startDay: slot.startDay, endDay: slot.endDay,
        openTime: slot.openTime, closedTime: slot.closedTime,
      }).pipe(take(1)).subscribe({
        next: created => {
          slot.id = created.id;
          slot.isSaving = false;
          this.toastService.show('Radno vrijeme sačuvano', 'success');
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('[VenueModal] Failed to create hours:', err);
          this.toastService.show('Greška pri kreiranju radnog vremena', 'error');
          slot.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  formatDayRange(slot: HoursSlot): string {
    if (slot.startDay === slot.endDay) return this.dayLabels[slot.startDay];
    return `${this.dayLabelsShort[slot.startDay]} – ${this.dayLabelsShort[slot.endDay]}`;
  }

  loadImages(): void {
    if (!this.venueId) return;
    this.isLoadingImages = true;
    this.cdr.markForCheck();

    this.venueImageService.getByVenueId(this.venueId)
      .pipe(take(1))
      .subscribe({
        next: (imgs) => {
          this.images = [...imgs].sort((a, b) =>
            a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
          );
          this.isLoadingImages = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastService.show('Greška pri učitavanju slika', 'error');
          this.isLoadingImages = false;
          this.cdr.markForCheck();
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Dozvoljeni su samo fajlovi slika.';
      this.cdr.markForCheck();
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError = 'Maksimalna veličina fajla je 10MB.';
      this.cdr.markForCheck();
      return;
    }

    this.uploadError = '';
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFilePreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.venueId) return;
    this.isUploadingImage = true;
    this.uploadError = '';
    this.cdr.markForCheck();

    this.venueImageService.uploadVenueImage(this.venueId, this.selectedFile, this.uploadIsPrimary)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.show('Slika uspješno uploadovana', 'success');
          this.selectedFile = null;
          this.selectedFilePreview = null;
          this.uploadIsPrimary = false;
          this.isUploadingImage = false;
          this.cdr.markForCheck();
          this.loadImages();
        },
        error: () => {
          this.toastService.show('Greška pri uploadu slike', 'error');
          this.uploadError = 'Upload nije uspio. Pokušaj ponovo.';
          this.isUploadingImage = false;
          this.cdr.markForCheck();
        }
      });
  }

  setAsPrimary(id: string): void {
    if (!this.venueId) return;
    this.settingPrimaryId = id;
    this.cdr.markForCheck();

    this.venueImageService.setPrimaryImage(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.images = this.images
            .map(img => ({ ...img, isPrimary: img.id === id }))
            .sort((a, b) => a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1);
          this.settingPrimaryId = null;
          this.toastService.show('Glavna slika ažurirana', 'success');
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastService.show('Greška pri postavljanju glavne slike', 'error');
          this.settingPrimaryId = null;
          this.cdr.markForCheck();
        }
      });
  }

  deleteImage(id: string): void {
    this.deletingImageId = id;
    this.cdr.markForCheck();

    this.venueImageService.deleteVenueImage(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.show('Slika obrisana', 'success');
          this.images = this.images.filter(img => img.id !== id);
          this.deletingImageId = null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastService.show('Greška pri brisanju slike', 'error');
          this.deletingImageId = null;
          this.cdr.markForCheck();
        }
      });
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploadError = '';
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();

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
          this.cdr.markForCheck();
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
          this.cdr.markForCheck();
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