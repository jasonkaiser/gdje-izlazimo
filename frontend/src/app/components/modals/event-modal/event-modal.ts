import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

import { ModalService } from '../../../core/services/modal';
import { EventService } from '../../../core/api/event-service';
import { ToastService } from '../../../core/ui/toast';
import { EventResponseDto } from '../../../core/models/events/event-response.dto';
import { CreateEventDto } from '../../../core/models/events/create-event.request';
import { UpdateEventDto } from '../../../core/models/events/update-event.request';

interface EventModalData {
  mode: 'create' | 'edit';
  event?: EventResponseDto;
  venueId: string;
}

type EventModalTab = 'details' | 'image';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-modal.html',
  styleUrls: ['./event-modal.css'],
})
export class EventModalComponent implements OnInit {
  @Input() data!: EventModalData;

  private readonly modalService  = inject(ModalService);
  private readonly eventService  = inject(EventService);
  private readonly toastService  = inject(ToastService);
  private readonly cdr           = inject(ChangeDetectorRef);

  mode: 'create' | 'edit' = 'create';
  eventId: string | null  = null;
  isSubmitting            = false;
  activeTab: EventModalTab = 'details';

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
    return !!(this.formData.name?.trim() && this.formData.eventDateTime);
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
      this.activeTab = 'details';
    }
  }

  setTab(tab: EventModalTab): void {
    this.activeTab = tab;
  }


  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
    input.value = '';
  }

  private processFile(file: File): void {
    this.uploadError = '';

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
    if (!this.formData.name.trim()) {
      this.toastService.show('Naziv je obavezan', 'error'); return;
    }
    if (!this.formData.eventDateTime) {
      this.toastService.show('Datum i vrijeme su obavezni', 'error'); return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    if (this.mode === 'edit' && this.eventId) {
      this.updateEvent();
    } else {
      this.createEvent();
    }
  }

  private createEvent(): void {
    const dto: CreateEventDto = {
      venueId:       this.data.venueId,
      name:          this.formData.name.trim(),
      description:   this.formData.description.trim() || undefined,
      eventDateTime: this.formData.eventDateTime,
    };

    this.eventService.createEvent(dto)
      .pipe(take(1))
      .subscribe({
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

    this.eventService.uploadEventImage(this.eventId, this.selectedFile)
      .pipe(take(1))
      .subscribe({
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
      name:          this.formData.name.trim(),
      description:   this.formData.description.trim() || undefined,
      eventDateTime: this.formData.eventDateTime,
    };

    this.eventService.updateEvent(this.eventId, dto)
      .pipe(take(1))
      .subscribe({
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

  onClose(): void {
    this.modalService.close();
  }

  private toDateTimeLocal(iso: string): string {
    if (!iso) return '';
    return iso.length >= 16 ? iso.substring(0, 16) : iso;
  }
}