import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

import { ModalService } from '../../../core/services/modal';
import { UserService } from '../../../core/api/user-service';
import { ToastService } from '../../../core/ui/toast';
import { Role } from '../../../core/models/users/user-role.enum';
import { UserResponseDto } from '../../../core/models/users/user-response.dto';
import { UpdateUserRequest } from '../../../core/models/users/update-user.request';

interface UserModalData {
  mode: 'create' | 'edit';
  user?: UserResponseDto;
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.html',
  styleUrls: ['./user-modal.css']
})
export class UserModalComponent implements OnInit {
  @Input() data!: UserModalData;

  private readonly modalService = inject(ModalService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  mode: 'create' | 'edit' = 'create';
  userId: string | null = null;
  isSubmitting = false;

  formData = {
    name: '',
    phone: '',
    role: Role.USER
  };

  readonly Role = Role;

  ngOnInit(): void {
    this.mode = this.data.mode;

    if (this.mode === 'edit' && this.data.user) {
      this.userId = this.data.user.id;
      this.formData = {
        name: this.data.user.name,
        phone: this.data.user.phone,
        role: this.data.user.role
      };
    }
  }

  onClose(): void {
    this.modalService.close();
  }

  onSubmit(): void {
    if (!this.formData.name.trim()) {
      this.toastService.show('Ime je obavezno', 'error');
      return;
    }

    if (!this.formData.phone.trim()) {
      this.toastService.show('Telefon je obavezan', 'error');
      return;
    }

    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(this.formData.phone)) {
      this.toastService.show('Neispravan format telefona', 'error');
      return;
    }

    this.isSubmitting = true;

    if (this.mode === 'edit' && this.userId) {
      this.updateUser();
    } else {
      this.toastService.show(
        'Kreiranje korisnika nije podržano direktno. Korisnici se registruju putem signup API-ja.',
        'warning'
      );
      this.isSubmitting = false;
    }
  }

  private updateUser(): void {
    if (!this.userId) return;

    const originalRole = this.data.user?.role;
    const newRole = this.formData.role;
    const roleChanged = originalRole !== newRole;

    const request: UpdateUserRequest = {
      name: this.formData.name.trim(),
      phone: this.formData.phone.trim(),
      role: newRole
    };

    this.userService.updateUser(request, this.userId)
      .pipe(
        take(1),
        switchMap(() => {
          if (roleChanged) {
            return this.userService.updateUserRole(this.userId!, newRole);
          }
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.toastService.show('Korisnik uspješno ažuriran', 'success');
          this.modalService.close();
          window.dispatchEvent(new CustomEvent('user-updated'));
        },
        error: (err) => {
          this.toastService.show('Greška pri ažuriranju korisnika', 'error');
          this.isSubmitting = false;
        }
      });
  }

  getRoleLabel(role: Role): string {
    const labels: Record<Role, string> = {
      [Role.USER]: 'Korisnik',
      [Role.VENUE_OWNER]: 'Vlasnik Lokala',
      [Role.ADMIN]: 'Administrator'
    };
    return labels[role];
  }
}