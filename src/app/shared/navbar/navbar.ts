import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  constructor(public auth: Auth, private router: Router) {}

  ngOnInit(): void {
  this.auth.restoreSession().subscribe();
}
/*   ngOnInit(): void {
    if (this.auth.isLoggedIn() && !this.auth.currentUser()) {
      this.auth.me().subscribe({ error: () => this.auth.clearAuth() });
    }
  } */

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.auth.clearAuth();
        this.router.navigate(['/']);
      }
    });
  }
}