import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  DestroyRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  shareReplay,
  debounceTime,
  take,
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserResponseDto } from '../../../../core/models/users/user-response.dto';
import { Role } from '../../../../core/models/users/user-role.enum';
import { UserService } from '../../../../core/api/user-service';
import { ModalService } from '../../../../core/services/modal';
import { UserModalComponent } from '../../../../components/modals/user-modal/user-modal';
import { ToastService } from '../../../../core/ui/toast';
import { ConfirmModalComponent } from '../../../../components/modals/confirm-modal/confirm-modal';
import { AppDropdown } from '../../../../components/other/dropdown/dropdown';

type RoleFilter = 'ALL' | Role;

interface UserStats {
  total: number;
  users: number;
  venueOwners: number;
  admins: number;
}

interface ViewModel {
  items: UserResponseDto[];
  loading: boolean;
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AppDropdown],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsersComponent implements OnInit {

  private readonly userService   = inject(UserService);
  private readonly modalService  = inject(ModalService);
  private readonly toastService  = inject(ToastService);
  private readonly destroyRef    = inject(DestroyRef);

  searchQuery = '';
  roleFilter: RoleFilter = 'ALL';
  readonly pageSize = 10;

  readonly roleFilterOptions = [
    { value: 'ALL' as const,       label: 'Sve uloge' },
    { value: Role.USER,            label: 'Korisnici' },
    { value: Role.VENUE_OWNER,     label: 'Vlasnici lokala' },
    { value: Role.ADMIN,           label: 'Administratori' },
  ];

  private readonly search$      = new BehaviorSubject<string>('');
  private readonly roleFilter$  = new BehaviorSubject<RoleFilter>('ALL');
  private readonly pageNo$      = new BehaviorSubject<number>(1);
  private readonly refresh$     = new BehaviorSubject<void>(undefined);

  users$!: Observable<UserResponseDto[]>;
  stats$!: Observable<UserStats>;
  vm$!:    Observable<ViewModel>;

  @HostListener('window:user-updated')
  onUserUpdated(): void {
    this.refresh$.next();
  }

  ngOnInit(): void {
    this.initializeStreams();
  }

  private initializeStreams(): void {
    this.users$ = this.refresh$.pipe(
      switchMap(() =>
        this.userService.getUsers({ pageSize: 1000, sortBy: 'id', sortDir: 'DESC' }).pipe(
          catchError(() => {
            this.toastService.show('Greška pri učitavanju korisnika', 'error');
            return of([] as UserResponseDto[]);
          })
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.stats$ = this.users$.pipe(
      map((users) => ({
        total:       users.length,
        users:       users.filter((u) => u.role === Role.USER).length,
        venueOwners: users.filter((u) => u.role === Role.VENUE_OWNER).length,
        admins:      users.filter((u) => u.role === Role.ADMIN).length,
      })),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.vm$ = this.users$.pipe(
      switchMap((allUsers) =>
        this.search$.pipe(
          debounceTime(300),
          switchMap((search) =>
            this.roleFilter$.pipe(
              switchMap((roleFilter) =>
                this.pageNo$.pipe(
                  map((pageNo) => {
                    let filtered = this.applySearch(allUsers, search);
                    filtered = this.applyRoleFilter(filtered, roleFilter);

                    const start   = (pageNo - 1) * this.pageSize;
                    const end     = start + this.pageSize;
                    const hasMore = end < filtered.length;

                    return {
                      items:    filtered.slice(start, end),
                      loading:  false,
                      hasMore,
                      errorMsg: '',
                      pageNo,
                    };
                  })
                )
              )
            )
          )
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  private applySearch(users: UserResponseDto[], search: string): UserResponseDto[] {
    if (!search.trim()) return users;
    const query = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query)
    );
  }

  private applyRoleFilter(users: UserResponseDto[], roleFilter: RoleFilter): UserResponseDto[] {
    if (roleFilter === 'ALL') return users;
    return users.filter((u) => u.role === roleFilter);
  }

  onSearchChange(): void {
    this.search$.next(this.searchQuery);
    this.pageNo$.next(1);
  }

  onFilterChange(): void {
    this.roleFilter$.next(this.roleFilter);
    this.pageNo$.next(1);
  }

  nextPage(): void {
    this.pageNo$.next(this.pageNo$.getValue() + 1);
  }

  prevPage(): void {
    const current = this.pageNo$.getValue();
    if (current > 1) this.pageNo$.next(current - 1);
  }

  getRoleLabel(role: Role): string {
    const labels: Record<Role, string> = {
      [Role.USER]:        'Korisnik',
      [Role.VENUE_OWNER]: 'Vlasnik',
      [Role.ADMIN]:       'Admin',
    };
    return labels[role];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  editUser(user: UserResponseDto): void {
    this.modalService.open(UserModalComponent, { data: { mode: 'edit', user } });
  }

  viewUser(user: UserResponseDto): void {
  this.modalService.open(UserModalComponent, { data: { mode: 'view', user } });
}

  deleteUser(user: UserResponseDto): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      data: {
        title:       'Obriši Korisnika',
        message:     `Da li ste sigurni da želite obrisati korisnika "${user.name}"?\n\nOva akcija se ne može poništiti.`,
        confirmText: 'Obriši',
        cancelText:  'Otkaži',
        variant:     'danger',
      },
    });

    (modalRef.instance as ConfirmModalComponent).confirmed
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.userService.deleteUser(user.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.refresh$.next();
              this.toastService.show('Korisnik uspješno obrisan', 'success');
            },
            error: () => {
              this.toastService.show('Greška pri brisanju korisnika', 'error');
            },
          });
      });
  }
}