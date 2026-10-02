import { Component, OnInit } from '@angular/core';
import { AdminUser } from '../../../core/models/admin.model';
import { AdminService } from '../../../services/admin';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-admin-users',
  imports: [],
  templateUrl: './admin-users.html'
})
export class AdminUsers implements OnInit {
  users: AdminUser[] = [];
  loading = true;

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Nem sikerült betölteni a felhasználókat.');
      }
    });
  }

  changeRole(user: AdminUser, role: 'student' | 'admin'): void {
    const previousRole = user.role;
    user.role = role;

    this.adminService.updateUserRole(user.id, role).subscribe({
      next: response => this.toast.success(response.message ?? 'A szerepkör frissítve.'),
      error: error => {
        user.role = previousRole;
        this.toast.error(error.error?.message ?? 'Nem sikerült módosítani a szerepkört.');
      }
    });
  }

  toggleBan(user: AdminUser): void {
    this.adminService.toggleBan(user.id).subscribe({
      next: response => {
        user.is_banned = response.is_banned;
        this.toast.success(response.message ?? (user.is_banned ? 'Felhasználó letiltva.' : 'Felhasználó tiltása feloldva.'));
      },
      error: error => this.toast.error(error.error?.message ?? 'Nem sikerült módosítani a felhasználó állapotát.')
    });
  }

  get students(): number {
    return this.users.filter(user => user.role === 'student').length;
  }

  get admins(): number {
    return this.users.filter(user => user.role === 'admin').length;
  }

  get banned(): number {
    return this.users.filter(user => user.is_banned).length;
  }
}
