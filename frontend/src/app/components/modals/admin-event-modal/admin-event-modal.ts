import {
  Component,
  Input,
  OnInit,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ModalService } from '../../../core/services/modal';
import { EventService } from '../../../core/api/event-service';
import { VenueService } from '../../../core/api/venue-service';
import { ToastService } from '../../../core/ui/toast';
import { EventResponseDto } from '../../../core/models/events/event-response.dto';
import { VenueResponseDto } from '../../../core/models/venues/venue-response.dto';
import { CreateEventDto } from '../../../core/models/events/create-event.request';
import { UpdateEventDto } from '../../../core/models/events/update-event.request';

interface AdminEventModalData {
  mode: 'create' | 'edit';
  event?: EventResponseDto;
}

@Component({
  selector: 'app-admin-event-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-event-modal.html',
  styleUrls: ['./admin-event-modal.css'],
})
export class AdminEventModalComponent implements OnInit {
  @Input() data!: AdminEventModalData;

  private readonly modalService = inject(ModalService);
  private readonly eventService = inject(EventService);
  private readonly venueService = inject(VenueService);
  private readonly toastService = inject(ToastService);
  private readonly cdr          = inject(ChangeDetectorRef);

  mode: 'create' | 'edit' = 'create';
  eventId: string | null   = null;
  isSubmitting             = false;
  venuesLoading            = true;

  venues: VenueResponseDto[]       = [];
  venueSearchQuery                 = '';
  venueDropdownOpen                = false;
  selectedVenue: VenueResponseDto | null = null;

  selectedFile: File | null        = null;
  selectedFilePreview: string|null = null;
  isUploadingImage                 = false;
  isDeletingImage                  = false;
  uploadError                      = '';
  isDragOver                       = false;

  formData = {
    name:          '',
    description:   '',
    eventDateTime: '',
    imageUrl:      '',
  };

  get canSave(): boolean {
    return !!(
      this.formData.name?.trim() &&
      this.formData.eventDateTime &&
      (this.mode === 'edit' || this.selectedVenue)
    );
  }

  get filteredVenues(): VenueResponseDto[] {
    const q = this.venueSearchQuery.toLowerCase();
    if (!q) return this.venues;
    return this.venues.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.addressName?.toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    this.mode = this.data.mode;

    if (this.mode === 'edit' && this.data.event) {
      const ev = this.data.event;
      this.eventId = ev.id;
      this.formData = {
        name:          ev.name,
        description:   ev.description ?? '',
        eventDateTime: this.toDateTimeLocal(ev.eventDateTime),
        imageUrl:      ev.imageUrl ?? '',
      };
    }

    this.loadVenues();
  }

  private loadVenues(): void {
    this.venueService.getVenues({ pageSize: 1000, sortBy: 'name', sortDir: 'ASC' })
      .pipe(take(1), catchError(() => of([] as VenueResponseDto[])))
      .subscribe(venues => {
        this.venues = venues;
        this.venuesLoading = false;

        if (this.mode === 'edit' && this.data.event?.venueId) {
          this.selectedVenue = venues.find(v => v.id === this.data.event!.venueId) ?? null;
        }

        this.cdr.markForCheck();
      });
  }

  selectVenue(venue: VenueResponseDto): void {
    this.selectedVenue = venue;
    this.venueDropdownOpen = false;
    this.venueSearchQuery  = '';
    this.cdr.markForCheck();
  }

  clearVenue(): void {
    this.selectedVenue = null;
    this.cdr.markForCheck();
  }

  toggleVenueDropdown(): void {
    this.venueDropdownOpen = !this.venueDropdownOpen;
    if (this.venueDropdownOpen) {
      this.venueSearchQuery = '';
    }
    this.cdr.markForCheck();
  }

  closeVenueDropdown(): void {
    this.venueDropdownOpen = false;
    this.cdr.markForCheck();
  }


  onDragOver(e: DragEvent): void  { e.preventDefault(); e.stopPropagation(); this.isDragOver = true; }
  onDragLeave(e: DragEvent): void { e.preventDefault(); e.stopPropagation(); this.isDragOver = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault(); e.stopPropagation();
    this.isDragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
    input.value = '';
  }

  private processFile(file: File): void {
    this.uploadError = '';
    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Dozvoljeni su samo fajlovi slika.';
      this.cdr.markForCheck(); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError = 'Maksimalna veličina fajla je 10MB.';
      this.cdr.markForCheck(); return;
    }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      this.selectedFilePreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploadError = '';
    this.cdr.markForCheck();
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.eventId) return;
    this.isUploadingImage = true;
    this.uploadError = '';
    this.cdr.markForCheck();

    this.eventService.uploadEventImage(this.eventId, this.selectedFile)
      .pipe(take(1))
      .subscribe({
        next: (updated) => {
          this.formData.imageUrl = updated.imageUrl ?? '';
          this.selectedFile = null;
          this.selectedFilePreview = null;
          this.isUploadingImage = false;
          this.toastService.show('Slika uspješno uploadovana', 'success');
          this.cdr.markForCheck();
          window.dispatchEvent(new CustomEvent('event-updated'));
        },
        error: () => {
          this.uploadError = 'Upload nije uspio. Pokušaj ponovo.';
          this.isUploadingImage = false;
          this.toastService.show('Greška pri uploadu slike', 'error');
          this.cdr.markForCheck();
        },
      });
  }

  deleteCurrentImage(): void {
    if (!this.eventId || !this.formData.imageUrl) return;
    this.isDeletingImage = true;
    this.cdr.markForCheck();

    this.eventService.deleteEventImage(this.eventId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.formData.imageUrl = '';
          this.isDeletingImage = false;
          this.toastService.show('Slika obrisana', 'success');
          this.cdr.markForCheck();
          window.dispatchEvent(new CustomEvent('event-updated'));
        },
        error: () => {
          this.isDeletingImage = false;
          this.toastService.show('Greška pri brisanju slike', 'error');
          this.cdr.markForCheck();
        },
      });
  }


  onSubmit(): void {
    if (!this.formData.name.trim()) { this.toastService.show('Naziv je obavezan', 'error'); return; }
    if (!this.formData.eventDateTime) { this.toastService.show('Datum i vrijeme su obavezni', 'error'); return; }
    if (this.mode === 'create' && !this.selectedVenue) { this.toastService.show('Odaberite lokal', 'error'); return; }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.mode === 'edit' ? this.updateEvent() : this.createEvent();
  }

  private createEvent(): void {
    const dto: CreateEventDto = {
      venueId:       this.selectedVenue!.id,
      name:          this.formData.name.trim(),
      description:   this.formData.description.trim() || undefined,
      eventDateTime: this.formData.eventDateTime,
    };

    this.eventService.createEvent(dto).pipe(take(1)).subscribe({
      next: (created) => {
        this.toastService.show('Događaj uspješno kreiran', 'success');
        if (this.selectedFile && created.id) {
          this.eventId = created.id;
          this.uploadImageAfterCreate();
        } else {
          this.modalService.close();
          window.dispatchEvent(new CustomEvent('event-updated'));
        }
      },
      error: () => {
        this.toastService.show('Greška pri kreiranju događaja', 'error');
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  private uploadImageAfterCreate(): void {
    if (!this.selectedFile || !this.eventId) {
      this.modalService.close();
      window.dispatchEvent(new CustomEvent('event-updated'));
      return;
    }
    this.eventService.uploadEventImage(this.eventId, this.selectedFile).pipe(take(1)).subscribe({
      next: () => { this.modalService.close(); window.dispatchEvent(new CustomEvent('event-updated')); },
      error: () => {
        this.toastService.show('Događaj kreiran, ali upload slike nije uspio', 'error');
        this.modalService.close();
        window.dispatchEvent(new CustomEvent('event-updated'));
      },
    });
  }

  private updateEvent(): void {
    if (!this.eventId) return;
    const dto: UpdateEventDto = {
      name:          this.formData.name.trim(),
      description:   this.formData.description.trim() || undefined,
      eventDateTime: this.formData.eventDateTime,
    };
    this.eventService.updateEvent(this.eventId, dto).pipe(take(1)).subscribe({
      next: () => {
        this.toastService.show('Događaj uspješno ažuriran', 'success');
        this.modalService.close();
        window.dispatchEvent(new CustomEvent('event-updated'));
      },
      error: () => {
        this.toastService.show('Greška pri ažuriranju događaja', 'error');
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  onClose(): void { this.modalService.close(); }

  private toDateTimeLocal(iso: string): string {
    if (!iso) return '';
    return iso.length >= 16 ? iso.substring(0, 16) : iso;
  }
}