export interface User { id: number; name: string; email: string; }
export interface AuthResponse { user: User; token: string; }
export interface Category { id: number; name: string; color: string; user_id: number; }
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export interface Task {
  id: number; title: string; description?: string; status: TaskStatus; priority: TaskPriority;
  due_date?: string; category_id?: number; user_id: number; assigned_to?: number;
  category?: Category; assignedUser?: User; created_at?: string; updated_at?: string;
}
export interface CreateTaskDto {
  title: string; description?: string; status?: TaskStatus; priority?: TaskPriority;
  due_date?: string; category_id?: number; assigned_to?: number;
}
export interface KanbanColumn { id: TaskStatus; label: string; color: string; tasks: Task[]; }
