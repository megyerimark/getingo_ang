import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PersonalCodeResponse {
  saved: boolean;
  code: string;
  updated_at?: string | null;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalCodeService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(lessonId: number): Observable<PersonalCodeResponse> {
    return this.http.get<PersonalCodeResponse>(`${this.apiUrl}/lessons/${lessonId}/personal-code`);
  }

  save(lessonId: number, code: string): Observable<PersonalCodeResponse> {
    return this.http.put<PersonalCodeResponse>(`${this.apiUrl}/lessons/${lessonId}/personal-code`, { code });
  }

  reset(lessonId: number): Observable<PersonalCodeResponse> {
    return this.http.delete<PersonalCodeResponse>(`${this.apiUrl}/lessons/${lessonId}/personal-code`);
  }
}