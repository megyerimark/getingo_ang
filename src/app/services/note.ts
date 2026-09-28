import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Note {
  id: number;
  user_id: number;
  lesson_id: number;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  save(lessonId: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notes`, {
      lesson_id: lessonId,
      content
    });
  }

  getAll(): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/notes`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notes/${id}`);
  }
}