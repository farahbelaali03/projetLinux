import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <aside class="sidebar">
      <div class="sidebar-logo">Task<span>Flow</span></div>
      <div class="nav-section">Espace</div>
      <a routerLink="/dashboard" class="nav-item" [class.active]="activePage==='dashboard'">
        <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
        Dashboard
      </a>
      <a routerLink="/board" class="nav-item" [class.active]="activePage==='board'">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.5H2zm0 4h8v1.5H2zm0 4h10v1.5H2z"/></svg>
        Kanban Board
      </a>
      <div class="nav-section">Compte</div>
      <button class="nav-item" style="width:100%;text-align:left;background:none;border:none;cursor:pointer;font-family:var(--font-sans)" (click)="logout()">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Déconnexion
      </button>
      <div class="sidebar-footer">
        <div class="avatar">{{ initials() }}</div>
        <div style="overflow:hidden">
          <div style="font-size:13px;font-weight:500;color:var(--text-dark)">{{ auth.currentUser()?.name }}</div>
          <div style="font-size:11px;color:var(--text-light)">{{ auth.currentUser()?.email }}</div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() activePage = 'dashboard';
  constructor(public auth: AuthService) {}
  initials(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
  logout() { this.auth.logout().subscribe({ error: () => this.auth.clearSession() }); }
}
