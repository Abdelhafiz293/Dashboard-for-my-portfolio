import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private baseUrl = 'https://backend-for-abdelhafiz-portfolio.vercel.app/api'; // Your deployed backend URL
  private serverUrl = 'https://backend-for-abdelhafiz-portfolio.vercel.app'; // Base server URL for images

  constructor(private http: HttpClient) {}

  // Helper method to fix image URLs
  private fixImageUrl(url: string): string {
    if (url && url.includes('localhost:5000')) {
      return url.replace('http://localhost:5000', this.serverUrl);
    }
    return url;
  }

  // ========== SKILLS METHODS ==========
  getSkills(): Observable<any> {
    return this.http.get(`${this.baseUrl}/skills`).pipe(
      map((response: any) => {
        if (response.skills) {
          response.skills = response.skills.map((skill: any) => ({
            ...skill,
            iconUrl: this.fixImageUrl(skill.iconUrl)
          }));
        }
        return response;
      })
    );
  }

  getSkillById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/skills/${id}`).pipe(
      map((response: any) => ({
        ...response,
        iconUrl: this.fixImageUrl(response.iconUrl)
      }))
    );
  }

  // ========== PROJECTS METHODS ==========
  getProjects(): Observable<any> {
    return this.http.get(`${this.baseUrl}/projects`).pipe(
      map((response: any) => {
        if (response.allProjects) {
          response.allProjects = response.allProjects.map((project: any) => ({
            ...project,
            imageUrl: this.fixImageUrl(project.imageUrl)
          }));
        }
        return response;
      })
    );
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/projects/${id}`).pipe(
      map((response: any) => ({
        ...response,
        imageUrl: this.fixImageUrl(response.imageUrl)
      }))
    );
  }

  // ========== ABOUT METHODS ==========
  getAbout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/about`).pipe(
      map((response: any) => {
        if (response.data && response.data.profileImageUrl) {
          response.data.profileImageUrl = this.fixImageUrl(response.data.profileImageUrl);
        }
        return response;
      })
    );
  }

  // ========== CONTACT METHODS ==========
  getContacts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact`);
  }

  submitContact(contactData: Contact): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact`, contactData);
  }
}
