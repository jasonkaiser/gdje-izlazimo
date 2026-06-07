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
import { CreateEventDto, EventTicketTypeRequest } from '../../../core/models/events/create-event.request';
import { UpdateEventDto } from '../../../core/models/events/update-event.request';
import { AiEventGenerateResponse } from '../../../core/models/events/ai-event-generate.response';

interface AdminEventModalData {
  mode: 'create' | 'edit';
  event?: EventResponseDto;
}

interface TicketFormRow {
  name: string;
  description: string;
  price: string;
  currency: string;
  purchaseUrl: string;
  displayOrder: number;
  active: boolean;
}

const EVENT_TYPES = [
  { value: 'VENUE_EVENT', label: 'Događaj u lokalu' },
  { value: 'FESTIVAL',    label: 'Festival' },
  { value: 'CONCERT',     label: 'Koncert' },
  { value: 'PARTY',       label: 'Žurka' },
  { value: 'OTHER',       label: 'Ostalo' },
];

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

  readonly eventTypes = EVENT_TYPES;

  mode: 'create' | 'edit' = 'create';
  eventId: string | null   = null;
  isSubmitting             = false;
  venuesLoading            = true;

  venues: VenueResponseDto[]            = [];
  venueSearchQuery                      = '';
  venueDropdownOpen                     = false;
  selectedVenue: VenueResponseDto | null = null;

  selectedFile: File | null        = null;
  selectedFilePreview: string|null = null;
  isUploadingImage                 = false;
  isDeletingImage                  = false;
  uploadError                      = '';
  isDragOver                       = false;
  isGeneratingAi = false;
  aiError        = '';

  formData = {
    name:                     '',
    description:              '',
    eventDateTime:            '',
    eventEndDateTime:         '',
    eventType:                'VENUE_EVENT',
    locationName:             '',
    locationAddress:          '',
    externalOrganizerName:    '',
    externalOrganizerInstagram: '',
    featured:               false,
    imageUrl:                 '',
    latitude:                   null as number | null,
    longitude:                  null as number | null,
  };

  tickets: TicketFormRow[] = [];

  get isVenueEvent(): boolean {
    return this.formData.eventType === 'VENUE_EVENT';
  }

  get canSave(): boolean {
    return !!(
      this.formData.name?.trim() &&
      this.formData.eventDateTime &&
      (!this.isVenueEvent || this.selectedVenue)
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
        name:                     ev.name,
        description:              ev.description ?? '',
        eventDateTime:            this.toDateTimeLocal(ev.eventDateTime),
        eventEndDateTime:         ev.eventEndDateTime ? this.toDateTimeLocal(ev.eventEndDateTime) : '',
        eventType:                ev.eventType ?? 'VENUE_EVENT',
        locationName:             ev.locationName ?? '',
        locationAddress:          ev.locationAddress ?? '',
        externalOrganizerName:    ev.externalOrganizerName ?? '',
        externalOrganizerInstagram: '',
        featured:               ev.featured ?? false,
        imageUrl:                 ev.imageUrl ?? '',
        latitude:                 ev.latitude ?? null,
        longitude:                ev.longitude ?? null,
      };
      this.tickets = (ev.ticketTypes ?? []).map(t => ({
        name:         t.name,
        description:  t.description ?? '',
        price:        t.price != null ? String(t.price) : '',
        currency:     t.currency ?? 'BAM',
        purchaseUrl:  t.purchaseUrl,
        displayOrder: t.displayOrder,
        active:       true,
      }));
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

  onEventTypeChange(): void {
    if (this.isVenueEvent) {
      this.formData.locationName    = '';
      this.formData.locationAddress = '';
      this.formData.externalOrganizerName = '';
      this.formData.externalOrganizerInstagram = '';
    } else {
      this.selectedVenue = null;
    }
    this.cdr.markForCheck();
  }

  selectVenue(venue: VenueResponseDto): void {
    this.selectedVenue    = venue;
    this.venueDropdownOpen = false;
    this.venueSearchQuery  = '';
    this.cdr.markForCheck();
  }

  clearVenue(): void {
    this.selectedVenue = null;
    this.cdr.markForCheck();
  }

  closeVenueDropdown(): void {
    this.venueDropdownOpen = false;
    this.cdr.markForCheck();
  }

  // ── Tickets ───────────────────────────────────────────────────────────

  addTicket(): void {
    this.tickets.push({
      name:         '',
      description:  '',
      price:        '',
      currency:     'BAM',
      purchaseUrl:  '',
      displayOrder: this.tickets.length + 1,
      active:       true,
    });
    this.cdr.markForCheck();
  }

  removeTicket(index: number): void {
    this.tickets.splice(index, 1);
    this.tickets.forEach((t, i) => t.displayOrder = i + 1);
    this.cdr.markForCheck();
  }

  trackByIndex(index: number): number { return index; }

  // ── Image ─────────────────────────────────────────────────────────────

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
    reader.onload = ev => {
      this.selectedFilePreview = ev.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  clearSelectedFile(): void {
    this.selectedFile        = null;
    this.selectedFilePreview = null;
    this.uploadError         = '';
    this.cdr.markForCheck();
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.eventId) return;
    this.isUploadingImage = true;
    this.uploadError      = '';
    this.cdr.markForCheck();

    this.eventService.uploadEventImage(this.eventId, this.selectedFile)
      .pipe(take(1))
      .subscribe({
        next: (updated) => {
          this.formData.imageUrl   = updated.imageUrl ?? '';
          this.selectedFile        = null;
          this.selectedFilePreview = null;
          this.isUploadingImage    = false;
          this.toastService.show('Slika uspješno uploadovana', 'success');
          this.cdr.markForCheck();
          window.dispatchEvent(new CustomEvent('event-updated'));
        },
        error: () => {
          this.uploadError      = 'Upload nije uspio. Pokušaj ponovo.';
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
          this.isDeletingImage   = false;
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

  // ── Submit ────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.formData.name.trim()) {
      this.toastService.show('Naziv je obavezan', 'error'); return;
    }
    if (!this.formData.eventDateTime) {
      this.toastService.show('Datum i vrijeme su obavezni', 'error'); return;
    }
    if (this.isVenueEvent && !this.selectedVenue) {
      this.toastService.show('Odaberite lokal za ovaj tip događaja', 'error'); return;
    }
    for (const t of this.tickets) {
      if (!t.name.trim() || !t.purchaseUrl.trim()) {
        this.toastService.show('Svaka karta mora imati naziv i link za kupovinu', 'error'); return;
      }
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.mode === 'edit' ? this.updateEvent() : this.createEvent();
  }

  private buildTicketDtos(): EventTicketTypeRequest[] {
    return this.tickets.map((t, i) => ({
      name:         t.name.trim(),
      description:  t.description.trim() || undefined,
      price:        t.price ? parseFloat(t.price) : null,
      currency:     t.currency || 'BAM',
      purchaseUrl:  t.purchaseUrl.trim(),
      displayOrder: i + 1,
      active:       t.active,
    }));
  }

  private createEvent(): void {
    const dto: CreateEventDto = {
      venueId:                   this.isVenueEvent ? (this.selectedVenue?.id ?? null) : null,
      name:                      this.formData.name.trim(),
      description:               this.formData.description.trim() || undefined,
      eventDateTime:             this.formData.eventDateTime,
      eventEndDateTime:          this.formData.eventEndDateTime || null,
      eventType:                 this.formData.eventType,
      locationName:              this.formData.locationName.trim() || null,
      locationAddress:           this.formData.locationAddress.trim() || null,
      externalOrganizerName:     this.formData.externalOrganizerName.trim() || null,
      externalOrganizerInstagram: this.formData.externalOrganizerInstagram.trim() || null,
      featured:                this.formData.featured ?? false,
      ticketTypes:               this.buildTicketDtos(),
      latitude:  this.formData.latitude  ?? null,
      longitude: this.formData.longitude ?? null,
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
      next: () => {
        this.modalService.close();
        window.dispatchEvent(new CustomEvent('event-updated'));
      },
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
      name:                      this.formData.name.trim(),
      description:               this.formData.description.trim() || undefined,
      eventDateTime:             this.formData.eventDateTime,
      eventEndDateTime:          this.formData.eventEndDateTime || null,
      eventType:                 this.formData.eventType,
      locationName:              this.formData.locationName.trim() || null,
      locationAddress:           this.formData.locationAddress.trim() || null,
      externalOrganizerName:     this.formData.externalOrganizerName.trim() || null,
      externalOrganizerInstagram: this.formData.externalOrganizerInstagram.trim() || null,
      featured:                this.formData.featured ?? false,
      ticketTypes:               this.buildTicketDtos(),
      latitude:                  this.formData.latitude ?? null,
      longitude:                 this.formData.longitude ?? null,
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

  generateFromImage(): void {
  if (!this.selectedFile) return;

  this.isGeneratingAi = true;
  this.aiError = '';
  this.cdr.markForCheck();

  this.eventService.generateEventFromImage(this.selectedFile)
      .pipe(take(1))
      .subscribe({
        next: (res: AiEventGenerateResponse) => {
          if (res.name)        this.formData.name        = res.name;
          if (res.description) this.formData.description = res.description;
          if (res.eventDateTime) {
            const dt = res.eventDateTime.length >= 16
              ? res.eventDateTime.substring(0, 16)
              : res.eventDateTime;
            this.formData.eventDateTime = dt;
          }
          this.isGeneratingAi = false;
          this.toastService.show('AI prijedlog generisan uspješno', 'success');
          this.cdr.markForCheck();
        },
        error: () => {
          this.aiError = 'AI generisanje nije uspjelo. Pokušaj ponovo.';
          this.isGeneratingAi = false;
          this.toastService.show('Greška pri AI generisanju', 'error');
          this.cdr.markForCheck();
        },
      });
  }

  private toDateTimeLocal(iso: string): string {
    if (!iso) return '';
    return iso.length >= 16 ? iso.substring(0, 16) : iso;
  }
}