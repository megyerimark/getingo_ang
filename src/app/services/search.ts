import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Lesson } from '../core/models/lesson.model';

export interface SearchResult {
  results: {
    lessons: Lesson[];
    exercises: any[];
    projects: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResult> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchResult>(`${this.apiUrl}/search`, { params });
  }
}