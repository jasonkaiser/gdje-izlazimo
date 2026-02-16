import { Component, Input, OnInit, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css']
})
export class ConfirmModalComponent implements OnInit {
  @Input() data!: ConfirmModalData;
  @Output() confirmed = new EventEmitter<boolean>();

  private readonly modalService = inject(ModalService);

  title = '';
  message = '';
  confirmText = 'Potvrdi';
  cancelText = 'Otkaži';
  variant: ConfirmVariant = 'danger';

  ngOnInit(): void {
    this.title = this.data.title;
    this.message = this.data.message;
    this.confirmText = this.data.confirmText || 'Potvrdi';
    this.cancelText = this.data.cancelText || 'Otkaži';
    this.variant = this.data.variant || 'danger';
  }

  onCancel(): void {
    this.confirmed.emit(false);
    this.modalService.close();
  }

  onConfirm(): void {
    this.confirmed.emit(true);
    this.modalService.close();
  }

  getIconColor(): string {
    const colors: Record<ConfirmVariant, string> = {
      danger: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400'
    };
    return colors[this.variant];
  }

  getButtonClass(): string {
    const classes: Record<ConfirmVariant, string> = {
      danger: 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:border-red-500/40',
      warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/15 hover:border-yellow-500/40',
      info: 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15 hover:border-blue-500/40'
    };
    return classes[this.variant];
  }
}