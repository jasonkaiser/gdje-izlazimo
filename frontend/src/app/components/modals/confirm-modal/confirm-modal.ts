// confirm-modal.component.ts

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

  getAccentColor(): string {
    const colors: Record<ConfirmVariant, string> = {
      danger: 'rgba(239,68,68,1)',
      warning: 'rgba(234,179,8,1)',
      info: 'rgba(59,130,246,1)'
    };
    return colors[this.variant];
  }

  getAccentGradient(): { [key: string]: string } {
    const gradients: Record<ConfirmVariant, string> = {
      danger: `linear-gradient(to bottom,
        rgba(239,68,68,0) 0%,
        rgba(239,68,68,0.95) 18%,
        rgba(239,68,68,0.95) 82%,
        rgba(239,68,68,0) 100%)`,
      warning: `linear-gradient(to bottom,
        rgba(234,179,8,0) 0%,
        rgba(234,179,8,0.95) 18%,
        rgba(234,179,8,0.95) 82%,
        rgba(234,179,8,0) 100%)`,
      info: `linear-gradient(to bottom,
        rgba(59,130,246,0) 0%,
        rgba(59,130,246,0.95) 18%,
        rgba(59,130,246,0.95) 82%,
        rgba(59,130,246,0) 100%)`
    };

    const shadows: Record<ConfirmVariant, string> = {
      danger: '0 0 30px rgba(239,68,68,0.70)',
      warning: '0 0 30px rgba(234,179,8,0.70)',
      info: '0 0 30px rgba(59,130,246,0.70)'
    };

    return {
      background: gradients[this.variant],
      'box-shadow': shadows[this.variant]
    };
  }

  getRadialHighlight(): { [key: string]: string } {
    const highlights: Record<ConfirmVariant, string> = {
      danger: 'radial-gradient(circle at center, rgba(239,68,68,0.12) 0%, rgba(255,255,255,0) 60%)',
      warning: 'radial-gradient(circle at center, rgba(234,179,8,0.12) 0%, rgba(255,255,255,0) 60%)',
      info: 'radial-gradient(circle at center, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0) 60%)'
    };

    return {
      background: highlights[this.variant]
    };
  }

  getIconBadgeStyle(): { [key: string]: string } {
    const styles: Record<ConfirmVariant, { background: string; border: string }> = {
      danger: {
        background: 'rgba(239,68,68,0.14)',
        border: '1px solid rgba(239,68,68,0.3)'
      },
      warning: {
        background: 'rgba(234,179,8,0.14)',
        border: '1px solid rgba(234,179,8,0.3)'
      },
      info: {
        background: 'rgba(59,130,246,0.14)',
        border: '1px solid rgba(59,130,246,0.3)'
      }
    };

    return styles[this.variant];
  }

  getConfirmButtonClass(): string {
    const classes: Record<ConfirmVariant, string> = {
      danger: 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25 hover:border-red-500/50 hover:text-red-300',
      warning: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25 hover:border-yellow-500/50 hover:text-yellow-300',
      info: 'bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25 hover:border-blue-500/50 hover:text-blue-300'
    };
    return classes[this.variant];
  }
}