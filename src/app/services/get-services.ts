import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Define interfaces for your data types
export interface Skill {
  _id?: string;
  name: string;
  level: string;
  category?: string;
  iconUrl?: string;
}

export interface Project {
  _id?: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  link?: string;
  projectUrl?: string;
  githubUrl?: string;
  createdAt?: Date;
}

export interface About {
  _id?: string;
  description: string;
  profileImageUrl?: string;
}

export interface Contact {
  _id?: string;
  name: string;
  email: string;
  message: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class GetServices {
  private baseUrl = 'http://localhost:5000/api'; // Your backend URL

  constructor(private http: HttpClient) {}

  // ========== SKILLS METHODS ==========
  getSkills(): Observable<any> {
    return this.http.get(`${this.baseUrl}/skills`);
  }

  getSkillById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/skills/${id}`);
  }

  // ========== PROJECTS METHODS ==========
  getProjects(): Observable<any> {
    return this.http.get(`${this.baseUrl}/projects`);
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/projects/${id}`);
  }

  // ========== ABOUT METHODS ==========
  getAbout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/about`);
  }

  // ========== CONTACT METHODS ==========
  getContacts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact`);
  }

  submitContact(contactData: Contact): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact`, contactData);
  }
}
