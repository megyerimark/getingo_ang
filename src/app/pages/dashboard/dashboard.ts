import {
  Component,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import { Auth } from '../../services/auth';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  user: User | null = null;

  isLoading = true;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.auth.me().subscribe({

      next: user => {

        this.user = user;

        this.isLoading = false;

      },

      error: () => {

        this.isLoading = false;

      }

    });
  }

  logout(): void {

    this.auth.logout().subscribe({

      next: () => {

        this.router.navigate([
          '/login'
        ]);

      },

      error: () => {

        this.auth.clearAuth();

        this.router.navigate([
          '/login'
        ]);

      }

    });
  }
}