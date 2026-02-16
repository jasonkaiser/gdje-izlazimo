import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../core/services/modal';
import { VenueService } from '../../../core/api/venue-service';
import { UserService } from '../../../core/api/user-service';

import { VenueCategory } from '../../../core/models/venues/venue-category.enum';
import { VenueResponseDto } from '../../../core/models/venues/venue-response.dto';
import { CreateVenueRequest } from '../../../core/models/venues/create-venue.request';
import { UpdateVenueRequest } from '../../../core/models/venues/update-venue.request';
import { UserResponseDto } from '../../../core/models/users/user-response.dto';
import { Role } from '../../../core/models/users/user-role.enum';
import { take } from 'rxjs/operators';
import { ToastService } from '../../../core/ui/toast';

interface VenueModalData {
  mode: 'create' | 'edit';
  venue?: VenueResponseDto;
}

@Component({
  selector: 'app-venue-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venue-modal.html',
  styleUrls: ['./venue-modal.css']
})
export class VenueModalComponent implements OnInit {
  @Input() data!: VenueModalData;

  private readonly modalService = inject(ModalService);
  private readonly venueService = inject(VenueService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  mode: 'create' | 'edit' = 'create';
  venueId: string | null = null;
  isSubmitting = false;
  isLoadingOwners = false;

  venueOwners: UserResponseDto[] = [];

  // Form data
  formData = {
    name: '',
    description: '',
    addressName: '',
    phone: '',
    venueType: VenueCategory.CLUB,
    isActive: true,
    latitude: 43.8563, // Default: Sarajevo
    longitude: 18.4131,
    venueOwnerId: ''
  };

  // Expose VenueCategory enum to template
  readonly VenueCategory = VenueCategory;

  ngOnInit(): void {
    this.mode = this.data.mode;

    if (this.mode === 'edit' && this.data.venue) {
      this.venueId = this.data.venue.id;
      this.formData = {
        name: this.data.venue.name,
        description: this.data.venue.description || '',
        addressName: this.data.venue.addressName,
        phone: this.data.venue.phone,
        venueType: this.data.venue.venueType,
        isActive: this.data.venue.isActive,
        latitude: this.data.venue.latitude,
        longitude: this.data.venue.longitude,
        venueOwnerId: '' // Not needed for edit
      };
    } else if (this.mode === 'create') {
      // Load venue owners for create mode
      this.loadVenueOwners();
    }
  }

  loadVenueOwners(): void {
    this.isLoadingOwners = true;
    this.userService.getUsers({ 
      role: Role.VENUE_OWNER, 
      pageSize: 1000 
    })
      .pipe(take(1))
      .subscribe({
        next: (owners) => {
          this.venueOwners = owners;
          this.isLoadingOwners = false;
        },
        error: (err) => {
          console.error('[VenueModal] Failed to load venue owners:', err);
          this.toastService.show('Greška pri učitavanju vlasnika lokala', 'error');
          this.isLoadingOwners = false;
        }
      });
  }

  onClose(): void {
    this.modalService.close();
  }

  onSubmit(): void {
    // Validation
    if (!this.formData.name.trim()) {
      this.toastService.show('Naziv je obavezan', 'error');
      return;
    }

    if (!this.formData.addressName.trim()) {
      this.toastService.show('Adresa je obavezna', 'error');
      return;
    }

    if (!this.formData.phone.trim()) {
      this.toastService.show('Telefon je obavezan', 'error');
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(this.formData.phone)) {
      this.toastService.show('Neispravan format telefona', 'error');
      return;
    }

    if (this.mode === 'create' && !this.formData.venueOwnerId) {
      this.toastService.show('Vlasnik lokala je obavezan', 'error');
      return;
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
      name: this.formData.name.trim(),
      description: this.formData.description.trim() || undefined,
      addressName: this.formData.addressName.trim(),
      phone: this.formData.phone.trim(),
      venueType: this.formData.venueType,
      isActive: this.formData.isActive,
      latitude: this.formData.latitude,
      longitude: this.formData.longitude,
      venueOwnerId: this.formData.venueOwnerId
    };

    this.venueService.createVenue(request)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.show('Lokal uspješno kreiran', 'success');
          this.modalService.close();
          window.dispatchEvent(new CustomEvent('venue-updated'));
        },
        error: (err) => {
          console.error('[VenueModal] Failed to create venue:', err);
          this.toastService.show('Greška pri kreiranju lokala', 'error');
          this.isSubmitting = false;
        }
      });
  }

  private updateVenue(): void {
    if (!this.venueId) return;

    const request: UpdateVenueRequest = {
      name: this.formData.name.trim(),
      description: this.formData.description.trim() || undefined,
      addressName: this.formData.addressName.trim(),
      venueType: this.formData.venueType,
      phone: this.formData.phone.trim(),
      isActive: this.formData.isActive
    };

    console.log('[VenueModal] Update request:', request);

    this.venueService.updateVenue(request, this.venueId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.show('Lokal uspješno ažuriran', 'success');
          this.modalService.close();
          window.dispatchEvent(new CustomEvent('venue-updated'));
        },
        error: (err) => {
          console.error('[VenueModal] Failed to update venue:', err);
          this.toastService.show('Greška pri ažuriranju lokala', 'error');
          this.isSubmitting = false;
        }
      });
  }

  getCategoryLabel(category: VenueCategory): string {
    const labels: Record<VenueCategory, string> = {
      [VenueCategory.CLUB]: 'Klub',
      [VenueCategory.PUB]: 'Pub',
      [VenueCategory.LOUNGE]: 'Lounge',
      [VenueCategory.RESTAURANT]: 'Restoran'
    };
    return labels[category];
  }
}