import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, Category } from '../../shared/models';
import { SidebarComponent } from '../shared/sidebar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule],
  template: `
    <div class="app-shell">
      <app-sidebar activePage="dashboard" />
      <main class="main-content">
        <div class="page-header">
          <div>
            <div class="page-title">Tableau de bord</div>
            <div class="page-sub">Bienvenue, {{ auth.currentUser()?.name }} 👋</div>
          </div>
          <a routerLink="/board" class="btn btn-primary">+ Nouvelle tâche</a>
        </div>
        <div class="stats-grid">
          <div class="stat-card accent">
            <div class="stat-label">Total tâches</div>
            <div class="stat-value">{{ tasks().length }}</div>
            <div class="stat-trend">Toutes les tâches</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">À faire</div>
            <div class="stat-value"><span class="stat-dot" style="background:#94a3b8"></span>{{ pendingCount() }}</div>
            <div class="stat-trend">{{ pct(pendingCount()) }}% du total</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">En cours</div>
            <div class="stat-value"><span class="stat-dot" style="background:#f43f7e"></span>{{ inProgressCount() }}</div>
            <div class="stat-trend">{{ pct(inProgressCount()) }}% du total</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Terminé</div>
            <div class="stat-value"><span class="stat-dot" style="background:#22c55e"></span>{{ completedCount() }}</div>
            <div class="stat-trend">{{ pct(completedCount()) }}% complété</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--text-dark)">Tâches prioritaires</div>
          <a routerLink="/board" class="btn btn-outline" style="font-size:12px;padding:6px 14px">Voir toutes →</a>
        </div>
        <div *ngIf="loadingTasks" style="text-align:center;padding:40px;color:var(--text-light)">Chargement...</div>
        <div style="display:flex;flex-direction:column;gap:8px" *ngIf="!loadingTasks">
          <div *ngFor="let task of highPriorityTasks()"
            style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all .15s"
            routerLink="/board">
            <div style="display:flex;align-items:center;gap:14px">
              <div style="width:4px;height:36px;border-radius:4px" [style.background]="task.priority==='high'?'var(--rose)':task.priority==='medium'?'var(--amber)':'var(--green)'"></div>
              <div>
                <div style="font-size:14px;font-weight:500;color:var(--text-dark)">{{ task.title }}</div>
                <div style="font-size:12px;color:var(--text-light);margin-top:2px" *ngIf="task.description">{{ task.description | slice:0:60 }}...</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="tag" [class]="task.status==='pending'?'tag-gray':task.status==='in_progress'?'tag-rose':'tag-green'">
                {{ task.status==='pending'?'À faire':task.status==='in_progress'?'En cours':'Terminé' }}
              </span>
              <span style="font-size:11px;color:var(--text-light)" *ngIf="task.due_date">{{ task.due_date | date:'dd MMM' }}</span>
            </div>
          </div>
          <div *ngIf="highPriorityTasks().length===0" style="text-align:center;padding:32px;color:var(--text-light)">
            <div style="font-size:32px;margin-bottom:10px">🎉</div>
            <div style="font-weight:500;color:var(--text-mid)">Aucune tâche haute priorité</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin:32px 0 14px">
          <div style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--text-dark)">Catégories</div>
          <button class="btn btn-outline" (click)="showCatModal=true" style="font-size:12px;padding:6px 14px">+ Catégorie</button>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div *ngFor="let cat of categories()" style="display:flex;align-items:center;gap:8px;border:1px solid;border-radius:20px;padding:6px 12px;cursor:default" [style.borderColor]="cat.color+'40'" [style.background]="cat.color+'15'">
            <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0" [style.background]="cat.color"></span>
            <span style="font-size:13px;font-weight:500;color:var(--text-dark)">{{ cat.name }}</span>
            <button style="background:none;border:none;cursor:pointer;color:var(--text-light);font-size:16px;padding:0 0 0 4px" (click)="deleteCategory(cat.id)">×</button>
          </div>
          <div *ngIf="categories().length===0" style="color:var(--text-light);font-size:13px;padding:8px 0">Aucune catégorie.</div>
        </div>
      </main>
    </div>
    <div class="modal-overlay" *ngIf="showCatModal" (click)="showCatModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title">Nouvelle catégorie</div>
          <button class="btn-ghost" (click)="showCatModal=false">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input class="form-control" [(ngModel)]="newCatName" placeholder="ex: Frontend, Backend..."/>
        </div>
        <div class="form-group">
          <label class="form-label">Couleur</label>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <div *ngFor="let c of colorOptions" (click)="newCatColor=c"
              style="width:28px;height:28px;border-radius:50%;cursor:pointer;transition:transform .1s"
              [style.background]="c" [style.border]="newCatColor===c?'2px solid #1a1035':'2px solid transparent'"
              [style.transform]="newCatColor===c?'scale(1.15)':'scale(1)'"></div>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
          <button class="btn btn-outline" (click)="showCatModal=false">Annuler</button>
          <button class="btn btn-violet" (click)="createCategory()">Créer</button>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  tasks = signal<Task[]>([]); categories = signal<Category[]>([]); loadingTasks = true;
  showCatModal = false; newCatName = ''; newCatColor = '#7c3aed';
  colorOptions = ['#f43f7e','#7c3aed','#3b82f6','#22c55e','#f59e0b','#ef4444','#06b6d4','#10b981'];
  pendingCount = computed(() => this.tasks().filter(t => t.status==='pending').length);
  inProgressCount = computed(() => this.tasks().filter(t => t.status==='in_progress').length);
  completedCount = computed(() => this.tasks().filter(t => t.status==='completed').length);
  highPriorityTasks = computed(() => this.tasks().filter(t => t.priority==='high').slice(0,5));
  constructor(public auth: AuthService, private taskService: TaskService, private categoryService: CategoryService) {}
  ngOnInit() {
    this.taskService.getTasks().subscribe({ next: d => { this.tasks.set(d); this.loadingTasks=false; }, error: () => this.loadingTasks=false });
    this.categoryService.getCategories().subscribe({ next: d => this.categories.set(d) });
  }
  pct(n: number): number { const t=this.tasks().length; return t?Math.round((n/t)*100):0; }
  createCategory() {
    if (!this.newCatName.trim()) return;
    this.categoryService.createCategory(this.newCatName, this.newCatColor).subscribe({ next: cat => { this.categories.update(c=>[...c,cat]); this.showCatModal=false; this.newCatName=''; } });
  }
  deleteCategory(id: number) { this.categoryService.deleteCategory(id).subscribe({ next: () => this.categories.update(c=>c.filter(x=>x.id!==id)) }); }
}
