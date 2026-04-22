import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task, Category, KanbanColumn, CreateTaskDto, TaskStatus } from '../../../shared/models';
import { SidebarComponent } from '../../shared/sidebar.component';

@Component({
  selector: 'app-team-board',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="app-shell">
      <app-sidebar activePage="board" />
      <main class="main-content">
        <div class="page-header">
          <div>
            <div class="page-title">Kanban Board</div>
            <div class="page-sub">Glissez les cartes pour changer le statut</div>
          </div>
          <div style="display:flex;gap:10px">
            <select class="form-control" style="width:auto;font-size:13px;padding:8px 32px 8px 12px" [(ngModel)]="filterPriority" (ngModelChange)="applyFilter()">
              <option value="">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
            <button class="btn btn-primary" (click)="openCreateModal()">+ Nouvelle tâche</button>
          </div>
        </div>
        <div *ngIf="loading" style="text-align:center;padding:60px;color:var(--text-light)">Chargement du board...</div>
        <div class="board-grid" *ngIf="!loading">
          <div *ngFor="let col of columns()" class="kanban-col"
            [style.background]="col.id==='in_progress'?'var(--rose-soft)':col.id==='completed'?'#f0fdf4':'var(--bg)'"
            (dragover)="onDragOver($event)" (drop)="onDrop($event, col.id)">
            <div class="col-header">
              <span class="col-dot" [style.background]="col.color"></span>
              <span class="col-title">{{ col.label }}</span>
              <span class="col-count">{{ col.tasks.length }}</span>
            </div>
            <div *ngFor="let task of col.tasks" class="task-card"
              [class.in-progress]="task.status==='in_progress'" [class.completed]="task.status==='completed'"
              draggable="true" (dragstart)="onDragStart(task)" (click)="selectedTask=task">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-tags">
                <span class="tag" [class]="task.priority==='high'?'tag-rose':task.priority==='medium'?'tag-amber':'tag-green'">
                  {{ task.priority==='high'?'🔴 Haute':task.priority==='medium'?'🟡 Moyenne':'🟢 Basse' }}
                </span>
                <span class="tag tag-violet" *ngIf="task.category">{{ task.category.name }}</span>
              </div>
              <div class="task-footer">
                <span class="task-due" [class.overdue]="isOverdue(task.due_date)" *ngIf="task.due_date">📅 {{ task.due_date | date:'dd MMM' }}</span>
                <span *ngIf="!task.due_date"></span>
                <div class="mini-avatars">
                  <div class="mini-av" style="background:linear-gradient(135deg,#f43f7e,#7c3aed)">{{ getInitials(auth.currentUser()?.name||'') }}</div>
                </div>
              </div>
            </div>
            <button class="add-task-btn" (click)="openCreateModal(col.id)">+ Ajouter</button>
          </div>
        </div>
      </main>
    </div>
    <div class="modal-overlay" *ngIf="showCreateModal" (click)="showCreateModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title">Nouvelle tâche</div>
          <button class="btn-ghost" (click)="showCreateModal=false">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Titre *</label>
          <input class="form-control" [(ngModel)]="newTask.title" placeholder="Titre de la tâche..."/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-control" [(ngModel)]="newTask.description" rows="3" placeholder="Description optionnelle..." style="resize:vertical"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="form-group">
            <label class="form-label">Statut</label>
            <select class="form-control" [(ngModel)]="newTask.status">
              <option value="pending">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priorité</label>
            <select class="form-control" [(ngModel)]="newTask.priority">
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="form-group">
            <label class="form-label">Catégorie</label>
            <select class="form-control" [(ngModel)]="newTask.category_id">
              <option [ngValue]="undefined">Aucune</option>
              <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date limite</label>
            <input type="date" class="form-control" [(ngModel)]="newTask.due_date"/>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px">
          <button class="btn btn-outline" (click)="showCreateModal=false">Annuler</button>
          <button class="btn btn-primary" (click)="createTask()" [disabled]="!newTask.title||savingTask">{{ savingTask?'Création...':'Créer la tâche' }}</button>
        </div>
      </div>
    </div>
    <div class="modal-overlay" *ngIf="selectedTask" (click)="selectedTask=null">
      <div class="modal" style="max-width:520px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title">{{ selectedTask!.title }}</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost" style="color:var(--rose);font-size:12px" (click)="deleteTask(selectedTask!.id)">Supprimer</button>
            <button class="btn-ghost" (click)="selectedTask=null">✕</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
          <span class="tag" [class]="selectedTask!.priority==='high'?'tag-rose':selectedTask!.priority==='medium'?'tag-amber':'tag-green'">{{ selectedTask!.priority==='high'?'Haute':selectedTask!.priority==='medium'?'Moyenne':'Basse' }}</span>
          <span class="tag tag-gray">{{ selectedTask!.status==='pending'?'À faire':selectedTask!.status==='in_progress'?'En cours':'Terminé' }}</span>
          <span class="tag tag-violet" *ngIf="selectedTask!.category">{{ selectedTask!.category!.name }}</span>
        </div>
        <div style="font-size:14px;color:var(--text-mid);margin-bottom:20px;line-height:1.6" *ngIf="selectedTask!.description">{{ selectedTask!.description }}</div>
        <div style="font-size:13px;color:var(--text-light);margin-bottom:20px" *ngIf="selectedTask!.due_date">📅 Échéance : <strong style="color:var(--text-mid)">{{ selectedTask!.due_date | date:'dd MMMM yyyy' }}</strong></div>
        <div style="font-size:11px;font-weight:600;letter-spacing:.3px;color:var(--text-mid);text-transform:uppercase;margin-bottom:8px">Changer le statut</div>
        <div style="display:flex;gap:8px">
          <button class="btn" style="font-size:12px" [class.btn-violet]="selectedTask!.status==='pending'" [class.btn-outline]="selectedTask!.status!=='pending'" (click)="changeStatus(selectedTask!, 'pending')">À faire</button>
          <button class="btn" style="font-size:12px" [class.btn-primary]="selectedTask!.status==='in_progress'" [class.btn-outline]="selectedTask!.status!=='in_progress'" (click)="changeStatus(selectedTask!, 'in_progress')">En cours</button>
          <button class="btn btn-outline" style="font-size:12px" [style.background]="selectedTask!.status==='completed'?'#dcfce7':''" [style.color]="selectedTask!.status==='completed'?'#16a34a':''" (click)="changeStatus(selectedTask!, 'completed')">Terminé</button>
        </div>
      </div>
    </div>
  `
})
export class TeamBoardComponent implements OnInit {
  tasks = signal<Task[]>([]); categories = signal<Category[]>([]); loading = true;
  filterPriority = ''; showCreateModal = false; savingTask = false; selectedTask: Task|null = null; draggedTask: Task|null = null;
  newTask: CreateTaskDto & { due_date?: string } = { title:'', description:'', status:'pending', priority:'medium' };
  columns = signal<KanbanColumn[]>([
    { id:'pending', label:'À FAIRE', color:'#94a3b8', tasks:[] },
    { id:'in_progress', label:'EN COURS', color:'#f43f7e', tasks:[] },
    { id:'completed', label:'TERMINÉ', color:'#22c55e', tasks:[] }
  ]);
  constructor(public auth: AuthService, private taskService: TaskService, private categoryService: CategoryService) {}
  ngOnInit() {
    this.taskService.getTasks().subscribe({ next: d => { this.tasks.set(d); this.rebuildColumns(d); this.loading=false; }, error: () => this.loading=false });
    this.categoryService.getCategories().subscribe({ next: d => this.categories.set(d) });
  }
  applyFilter() { const all=this.tasks(); this.rebuildColumns(this.filterPriority?all.filter(t=>t.priority===this.filterPriority):all); }
  rebuildColumns(tasks: Task[]) { this.columns.update(cols=>cols.map(col=>({...col,tasks:tasks.filter(t=>t.status===col.id)}))); }
  openCreateModal(defaultStatus?: string) { this.newTask={title:'',description:'',status:(defaultStatus as TaskStatus)||'pending',priority:'medium'}; this.showCreateModal=true; }
  createTask() {
    if (!this.newTask.title?.trim()) return; this.savingTask=true;
    this.taskService.createTask(this.newTask).subscribe({ next: task => { this.tasks.update(ts=>[...ts,task]); this.applyFilter(); this.showCreateModal=false; this.savingTask=false; }, error: ()=>this.savingTask=false });
  }
  changeStatus(task: Task, status: TaskStatus) {
    this.taskService.updateStatus(task.id, status).subscribe({ next: updated => { this.tasks.update(ts=>ts.map(t=>t.id===updated.id?updated:t)); this.applyFilter(); if(this.selectedTask?.id===updated.id) this.selectedTask=updated; } });
  }
  deleteTask(id: number) { this.taskService.deleteTask(id).subscribe({ next: ()=>{ this.tasks.update(ts=>ts.filter(t=>t.id!==id)); this.applyFilter(); this.selectedTask=null; } }); }
  onDragStart(task: Task) { this.draggedTask=task; }
  onDragOver(e: DragEvent) { e.preventDefault(); }
  onDrop(e: DragEvent, status: TaskStatus) { e.preventDefault(); if(!this.draggedTask||this.draggedTask.status===status) return; this.changeStatus(this.draggedTask,status); this.draggedTask=null; }
  getInitials(name: string): string { return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2); }
  isOverdue(date?: string): boolean { if(!date) return false; return new Date(date)<new Date(); }
}
