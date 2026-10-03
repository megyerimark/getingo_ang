import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  isMenuOpen = false;

  constructor(
    public auth: Auth,
    private router: Router,
    private toast: ToastService,
    public theme: ThemeService
  ) {}

  ngOnInit(): void {
    this.auth.restoreSession().subscribe();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.closeMenu();

    this.auth.logout().subscribe({
      next: response => {
        this.toast.success(response.message ?? 'Sikeresen kijelentkeztél.');
        this.router.navigate(['/']);
      },
      error: () => this.toast.error('A kijelentkezés nem sikerült. Próbáld újra.')
    });
  }
}