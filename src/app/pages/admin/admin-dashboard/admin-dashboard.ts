import { Component, OnInit } from '@angular/core';
import { AdminStats } from '../../../core/models/admin.model';
import { AdminService } from '../../../services/admin';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  stats: AdminStats | null = null;
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: stats => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}