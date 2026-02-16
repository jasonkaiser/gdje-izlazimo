import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  shareReplay,
  take
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableTypeResponseDto } from '../../../../core/models/table-types/table-type-response.dto';
import { CreateTableTypeRequest } from '../../../../core/models/table-types/create-table-type.request';
import { TableTypeService } from '../../../../core/api/table-type-service';
import { ModalService } from '../../../../core/services/modal';
import { ToastService } from '../../../../core/ui/toast';
import { ConfirmModalComponent } from '../../../../components/modals/confirm-modal/confirm-modal';

interface ViewModel {
  items: TableTypeResponseDto[];
  loading: boolean;
  errorMsg: string;
}

@Component({
  selector: 'app-admin-table-types',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-table-types.html',
  styleUrl: './admin-table-types.css'
})
export class AdminTableTypesComponent implements OnInit {
  
  private readonly tableTypeService = inject(TableTypeService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  // State
  showModal = false;
  isEditing = false;
  editingId: string | null = null;
  
  formData = {
    name: '',
    description: ''
  };

  // Subjects
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  // Observables
  vm$!: Observable<ViewModel>;

  ngOnInit(): void {
    this.initializeStreams();
  }

  private initializeStreams(): void {
    
    this.vm$ = this.refresh$.pipe(
      switchMap(() =>
        this.tableTypeService.getAllTableTypes().pipe(
          map(items => ({
            items,
            loading: false,
            errorMsg: ''
          })),
          catchError(err => {
            console.error('[AdminTableTypes] Failed to load table types:', err);
            this.toastService.show('Greška pri učitavanju tipova stolova', 'error');
            return of({
              items: [],
              loading: false,
              errorMsg: 'Greška pri učitavanju tipova stolova'
            });
          })
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('bs-BA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      name: '',
      description: ''
    };
    this.showModal = true;
  }

  editTableType(tableType: TableTypeResponseDto): void {
    this.isEditing = true;
    this.editingId = tableType.id;
    this.formData = {
      name: tableType.name,
      description: tableType.description || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      name: '',
      description: ''
    };
  }

  saveTableType(): void {
    if (!this.formData.name.trim()) {
      this.toastService.show('Naziv je obavezan', 'error');
      return;
    }

    const request: CreateTableTypeRequest = {
      name: this.formData.name.trim(),
      description: this.formData.description?.trim() || undefined
    };

    if (this.isEditing && this.editingId) {
      // Update
      this.tableTypeService.updateTableType(this.editingId, request)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.closeModal();
            this.refresh$.next();
            this.toastService.show('Tip stola uspješno ažuriran', 'success');
          },
          error: err => {
            console.error('[AdminTableTypes] Failed to update:', err);
            this.toastService.show('Greška pri ažuriranju', 'error');
          }
        });
    } else {
      // Create
      this.tableTypeService.createTableType(request)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.closeModal();
            this.refresh$.next();
            this.toastService.show('Tip stola uspješno kreiran', 'success');
          },
          error: err => {
            console.error('[AdminTableTypes] Failed to create:', err);
            this.toastService.show('Greška pri kreiranju', 'error');
          }
        });
    }
  }

  deleteTableType(tableType: TableTypeResponseDto): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      data: {
        title: 'Obriši Tip Stola',
        message: `Da li ste sigurni da želite obrisati tip stola "${tableType.name}"?\n\nOva akcija se ne može poništiti.`,
        confirmText: 'Obriši',
        cancelText: 'Otkaži',
        variant: 'danger'
      }
    });

    (modalRef.instance as ConfirmModalComponent).confirmed
      .pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this.tableTypeService.deleteTableType(tableType.id)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.refresh$.next();
                this.toastService.show('Tip stola uspješno obrisan', 'success');
              },
              error: err => {
                console.error('[AdminTableTypes] Failed to delete:', err);
                this.toastService.show('Greška pri brisanju', 'error');
              }
            });
        }
      });
  }
}