import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = 'http://localhost:8000/api';
  constructor(private http: HttpClient) {}
  getCategories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.API}/categories`); }
  createCategory(name: string, color: string): Observable<Category> { return this.http.post<Category>(`${this.API}/categories`, { name, color }); }
  deleteCategory(id: number): Observable<void> { return this.http.delete<void>(`${this.API}/categories/${id}`); }
}
