import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="auth-left">
        <div class="auth-logo">Task<span>Flow</span></div>
        <h1 class="auth-headline">Bon retour<br>parmi nous !</h1>
        <p class="auth-sub">Connectez-vous pour accéder à votre espace de travail.</p>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input type="email" class="form-control" [class.error]="errors['email']" placeholder="vous@exemple.com" [(ngModel)]="email" name="email"/>
            <div class="form-error" *ngIf="errors['email']">{{ errors['email'] }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input type="password" class="form-control" [class.error]="errors['password']" placeholder="••••••••" [(ngModel)]="password" name="password"/>
            <div class="form-error" *ngIf="errors['password']">{{ errors['password'] }}</div>
          </div>
          <div class="form-error" style="margin-bottom:14px" *ngIf="apiError">{{ apiError }}</div>
          <button type="submit" class="btn btn-primary w-full" [disabled]="loading" style="justify-content:center;padding:12px">
            {{ loading ? 'Connexion...' : 'Commencer maintenant →' }}
          </button>
        </form>
        <div class="auth-footer">Pas encore de compte ? <a routerLink="/register">Créer un compte</a></div>
      </div>
      <div class="auth-right">
        <div style="background:white;border-radius:20px;padding:24px;width:320px;box-shadow:0 20px 60px rgba(124,58,237,.15)">
          <div style="display:flex;gap:6px;margin-bottom:20px">
            <span style="width:10px;height:10px;border-radius:50%;background:#e2e8f0;display:block"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:#f43f7e;display:block"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:block"></span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            <div>
              <div style="font-size:9px;font-weight:700;letter-spacing:.7px;color:#94a3b8;margin-bottom:8px">À FAIRE</div>
              <div style="background:#faf8fd;border:1px solid rgba(124,58,237,.1);border-radius:8px;padding:8px;font-size:11px;font-weight:500;color:#1a1035;margin-bottom:6px">Config Docker</div>
              <div style="background:#faf8fd;border:1px solid rgba(124,58,237,.1);border-radius:8px;padding:8px;font-size:11px;font-weight:500;color:#1a1035">Fix CSS</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;letter-spacing:.7px;color:#f43f7e;margin-bottom:8px">EN COURS</div>
              <div style="background:#faf8fd;border-left:2.5px solid #f43f7e;border-radius:8px;padding:8px;font-size:11px;font-weight:500;color:#1a1035">Kanban UI</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;letter-spacing:.7px;color:#22c55e;margin-bottom:8px">TERMINÉ</div>
              <div style="background:#faf8fd;border-left:2.5px solid #22c55e;border-radius:8px;padding:8px;font-size:11px;font-weight:500;color:#1a1035;opacity:.7">Auth JWT ✓</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = ''; password = ''; loading = false; apiError = '';
  errors: Record<string, string> = {};
  constructor(private auth: AuthService, private router: Router) {}
  onSubmit() {
    this.errors = {}; this.apiError = '';
    if (!this.email) { this.errors['email'] = 'Email requis'; return; }
    if (!this.password) { this.errors['password'] = 'Mot de passe requis'; return; }
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => { this.loading = false; this.apiError = err.error?.message || 'Identifiants incorrects.'; }
    });
  }
}
