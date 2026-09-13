import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/authentication/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  // ==========================================
  // SIDEBAR STATE
  // ==========================================
  // true  = expanded
  // false = collapsed
  isCollapsed = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  // ==========================================
  // TOGGLE SIDEBAR
  // ==========================================
  toggleSidebar(): void {
    // Kapag true → magiging false
    // Kapag false → magiging true
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    // Remove JWT token from localStorage
    this.authService.logout();

    // Redirect back to login
    this.router.navigate(['/login']);
  }
}
