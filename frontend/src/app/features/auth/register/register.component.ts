import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="auth-left">
        <div class="auth-logo">Task<span>Flow</span></div>
        <h1 class="auth-headline">Créez votre<br>espace d'équipe.</h1>
        <p class="auth-sub">Rejoignez des milliers d'équipes qui gèrent leurs projets avec TaskFlow.</p>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Nom complet</label>
            <input type="text" class="form-control" [class.error]="errors['name']" placeholder="Votre nom" [(ngModel)]="name" name="name"/>
            <div class="form-error" *ngIf="errors['name']">{{ errors['name'] }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input type="email" class="form-control" [class.error]="errors['email']" placeholder="vous@exemple.com" [(ngModel)]="email" name="email"/>
            <div class="form-error" *ngIf="errors['email']">{{ errors['email'] }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input type="password" class="form-control" [class.error]="errors['password']" placeholder="Min. 8 caractères" [(ngModel)]="password" name="password"/>
            <div class="form-error" *ngIf="errors['password']">{{ errors['password'] }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirmer le mot de passe</label>
            <input type="password" class="form-control" [class.error]="errors['confirm']" placeholder="Répétez le mot de passe" [(ngModel)]="confirm" name="confirm"/>
            <div class="form-error" *ngIf="errors['confirm']">{{ errors['confirm'] }}</div>
          </div>
          <div class="form-error" style="margin-bottom:14px" *ngIf="apiError">{{ apiError }}</div>
          <button type="submit" class="btn btn-violet w-full" [disabled]="loading" style="justify-content:center;padding:12px">
            {{ loading ? 'Création...' : 'Créer mon compte →' }}
          </button>
        </form>
        <div class="auth-footer">Déjà un compte ? <a routerLink="/login">Se connecter</a></div>
      </div>
      <div class="auth-right">
        <div style="text-align:center;max-width:300px">
          <div style="font-size:48px;margin-bottom:20px">🚀</div>
          <div style="font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--text-dark);margin-bottom:12px">Collaborez en temps réel</div>
          <div style="font-size:14px;color:var(--text-mid);line-height:1.7">Créez des équipes, assignez des tâches, suivez la progression sur un board Kanban intuitif.</div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = ''; email = ''; password = ''; confirm = ''; loading = false; apiError = '';
  errors: Record<string, string> = {};
  constructor(private auth: AuthService, private router: Router) {}
  onSubmit() {
    this.errors = {}; this.apiError = '';
    if (!this.name.trim()) { this.errors['name'] = 'Nom requis'; return; }
    if (!this.email) { this.errors['email'] = 'Email requis'; return; }
    if (this.password.length < 8) { this.errors['password'] = 'Min. 8 caractères'; return; }
    if (this.password !== this.confirm) { this.errors['confirm'] = 'Les mots de passe ne correspondent pas'; return; }
    this.loading = true;
    this.auth.register(this.name, this.email, this.password, this.confirm).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => { this.loading = false; this.apiError = err.error?.message || 'Erreur lors de la création du compte.'; }
    });
  }
}
