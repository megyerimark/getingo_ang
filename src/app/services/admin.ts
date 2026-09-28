import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Category } from '../core/models/category.model';
import { environment } from '../../environments/environment';
import {
  AdminExercise,
  AdminLesson,
  AdminProject,
  AdminQuiz,
  AdminStats,
  AdminUser,
  AuditLog
} from '../core/models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  private unwrap<T>(response: any): T[] {
    return response?.data ?? response ?? [];
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/dashboard-stats`);
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<any>(`${this.apiUrl}/users`).pipe(map(response => this.unwrap<AdminUser>(response)));
  }

  updateUserRole(id: number, role: 'student' | 'admin'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/role`, { role });
  }

  toggleBan(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${id}/toggle-ban`, {});
  }

  getLessons(): Observable<AdminLesson[]> {
    return this.http.get<any>(`${this.apiUrl}/lessons`).pipe(map(response => this.unwrap<AdminLesson>(response)));
  }

  createLesson(data: Omit<AdminLesson, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/lessons`, data);
  }

  updateLesson(id: number, data: Omit<AdminLesson, 'id'>): Observable<any> {
    return this.http.put(`${this.apiUrl}/lessons/${id}`, data);
  }

  deleteLesson(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/lessons/${id}`);
  }

  getExercises(): Observable<AdminExercise[]> {
    return this.http.get<any>(`${this.apiUrl}/exercises`).pipe(map(response => this.unwrap<AdminExercise>(response)));
  }

  createExercise(data: Omit<AdminExercise, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/exercises`, data);
  }

  updateExercise(id: number, data: Omit<AdminExercise, 'id'>): Observable<any> {
    return this.http.put(`${this.apiUrl}/exercises/${id}`, data);
  }

  deleteExercise(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/exercises/${id}`);
  }

  getProjects(): Observable<AdminProject[]> {
    return this.http.get<any>(`${this.apiUrl}/projects`).pipe(map(response => this.unwrap<AdminProject>(response)));
  }

  createProject(data: Omit<AdminProject, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects`, data);
  }

  updateProject(id: number, data: Omit<AdminProject, 'id'>): Observable<any> {
    return this.http.put(`${this.apiUrl}/projects/${id}`, data);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`);
  }

  getQuizzes(): Observable<AdminQuiz[]> {
    return this.http.get<any>(`${this.apiUrl}/quizzes`).pipe(map(response => this.unwrap<AdminQuiz>(response)));
  }

  createQuiz(data: Omit<AdminQuiz, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/quizzes`, data);
  }

  updateQuiz(id: number, data: Omit<AdminQuiz, 'id'>): Observable<any> {
    return this.http.put(`${this.apiUrl}/quizzes/${id}`, data);
  }

  deleteQuiz(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/quizzes/${id}`);
  }

  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs`).pipe(map(response => this.unwrap<AuditLog>(response)));
  }
  getCategories(): Observable<Category[]> {
  return this.http.get<any>(`${this.apiUrl}/categories`).pipe(
    map(response => this.unwrap<Category>(response))
  );
}

createCategory(data: Omit<Category, 'id' | 'lessons_count' | 'exercises_count'>): Observable<any> {
  return this.http.post(`${this.apiUrl}/categories`, data);
}

updateCategory(id: number, data: Omit<Category, 'id' | 'lessons_count' | 'exercises_count'>): Observable<any> {
  return this.http.put(`${this.apiUrl}/categories/${id}`, data);
}

deleteCategory(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/categories/${id}`);
}
}