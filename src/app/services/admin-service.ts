import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // ========== SKILLS ADMIN METHODS ==========
  createSkill(skillData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/skills`, skillData, {
      headers: this.getAuthHeaders(),
    });
  }

  updateSkill(id: string, skillData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/skills/${id}`, skillData, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/skills/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ========== PROJECTS ADMIN METHODS ==========
  createProject(projectData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/projects`, projectData, {
      headers: this.getAuthHeaders(),
    });
  }

  updateProject(id: string, projectData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/projects/${id}`, projectData, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/projects/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ========== ABOUT ADMIN METHODS ==========
  updateAbout(aboutData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/about`, aboutData, {
      headers: this.getAuthHeaders(),
    });
  }

  uploadAboutImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http.post(`${this.baseUrl}/about/upload-image`, formData, {
      headers,
    });
  }

  // ========== CONTACTS ADMIN METHODS ==========
  getContacts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact`, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/contact/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ========== GENERAL UPLOAD METHOD ==========
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http.post(`${this.baseUrl}/upload`, formData, { headers });
  }
}
