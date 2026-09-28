import { Component, OnInit } from '@angular/core';
import { AdminUser } from '../../../core/models/admin.model';
import { AdminService } from '../../../services/admin';

@Component({
  selector: 'app-admin-users',
  imports: [],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsers implements OnInit {
  users: AdminUser[] = [];
  message = '';
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.getUsers().subscribe({
      next: users => this.users = users,
      error: () => this.errorMessage = 'Nem sikerült betölteni a felhasználókat.'
    });
  }

  changeRole(user: AdminUser): void {
    const role = user.role === 'admin' ? 'student' : 'admin';

    this.adminService.updateUserRole(user.id, role).subscribe({
      next: () => {
        this.message = 'Szerepkör módosítva.';
        this.load();
      },
      error: error => this.errorMessage = error.error?.message ?? 'Nem sikerült módosítani.'
    });
  }

  toggleBan(user: AdminUser): void {
    this.adminService.toggleBan(user.id).subscribe({
      next: response => {
        this.message = response.message;
        this.load();
      },
      error: error => this.errorMessage = error.error?.message ?? 'Nem sikerült módosítani.'
    });
  }
}