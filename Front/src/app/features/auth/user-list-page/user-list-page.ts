import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { User, userFullName } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

type LoadStatus = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-user-list-page',
  imports: [DatePipe, RouterLink, ConfirmDialog, PageState],
  templateUrl: './user-list-page.html',
  styleUrl: './user-list-page.scss',
})
export class UserListPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly fullName = userFullName;
  protected readonly currentUser = this.authService.currentUser;
  protected readonly status = signal<LoadStatus>('loading');
  protected readonly users = signal<User[]>([]);
  protected readonly countLabel = computed(() => {
    const count = this.users().length;
    return `${count} ${count > 1 ? 'utilisateurs' : 'utilisateur'}`;
  });

  protected readonly pendingDelete = signal<User | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.userService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  askDelete(user: User): void {
    this.deleteError.set(null);
    this.pendingDelete.set(user);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  confirmDelete(): void {
    const user = this.pendingDelete();
    if (!user || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    this.deleteError.set(null);
    this.userService
      .delete(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (user.id === this.currentUser()?.id) {
            this.authService.logout();
          }
          this.users.update((list) => list.filter((u) => u.id !== user.id));
          this.notice.set(`Le compte « ${userFullName(user)} » a été supprimé.`);
          this.deleting.set(false);
          this.pendingDelete.set(null);
        },
        error: () => {
          this.deleteError.set('La suppression a échoué. Veuillez réessayer.');
          this.deleting.set(false);
        },
      });
  }
}
