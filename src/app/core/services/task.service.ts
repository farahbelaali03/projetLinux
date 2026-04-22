import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly API = 'http://localhost:8000/api';
  constructor(private http: HttpClient) {}
  getTasks(): Observable<Task[]> { return this.http.get<Task[]>(`${this.API}/tasks`); }
  getTask(id: number): Observable<Task> { return this.http.get<Task>(`${this.API}/tasks/${id}`); }
  createTask(data: CreateTaskDto): Observable<Task> { return this.http.post<Task>(`${this.API}/tasks`, data); }
  updateTask(id: number, data: Partial<CreateTaskDto>): Observable<Task> { return this.http.put<Task>(`${this.API}/tasks/${id}`, data); }
  updateStatus(id: number, status: string): Observable<Task> { return this.http.put<Task>(`${this.API}/tasks/${id}`, { status }); }
  deleteTask(id: number): Observable<void> { return this.http.delete<void>(`${this.API}/tasks/${id}`); }
}
