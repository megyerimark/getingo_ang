import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin';
import { AdminStats } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  stats: AdminStats | null = null;
  loading = true;
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.getStats().subscribe({
      next: stats => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'Nem sikerült betölteni az admin statisztikákat.';
        this.loading = false;
      }
    });
  }

  get lessonCompletionRate(): number {
    return this.stats?.performance.lesson_completion_rate ?? 0;
  }

  get quizCompletionRate(): number {
    return this.stats?.performance.quiz_completion_rate ?? 0;
  }

  get engagementScore(): number {
    return this.stats?.performance.engagement_score ?? 0;
  }
}