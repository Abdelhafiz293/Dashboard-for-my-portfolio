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
    if (!url) {
      return 'https://via.placeholder.com/150?text=No+Image';
    }
    
    if (url.includes('localhost:5000')) {
      // For now, since images don't exist on deployed backend, use placeholders
      // Later this should be replaced with Cloudinary URLs
      const filename = url.split('/').pop();
      
      // Return placeholder images based on the context
      if (filename?.includes('788793496')) { // JavaScript
        return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg';
      } else if (filename?.includes('668778363')) { // HTML5
        return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg';
      } else if (filename?.includes('668456931')) { // CSS3
        return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg';
      } else if (filename?.includes('834729533')) { // Bootstrap
        return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg';
      } else if (filename?.includes('880086980')) { // Node.js
        return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg';
      } else if (filename?.includes('911281296')) { // Express.js
        return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg';
      } else if (filename?.includes('831597193')) { // MongoDB
        return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg';
      } else if (filename?.includes('220662758')) { // Project image
        return 'https://via.placeholder.com/400x250?text=Project+Screenshot';
      } else if (filename?.includes('745640026')) { // Profile image
        return 'https://via.placeholder.com/300x300?text=Profile+Photo';
      } else {
        return 'https://via.placeholder.com/150?text=Image';
      }
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
            iconUrl: this.fixImageUrl(skill.iconUrl),
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
        iconUrl: this.fixImageUrl(response.iconUrl),
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
            imageUrl: this.fixImageUrl(project.imageUrl),
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
        imageUrl: this.fixImageUrl(response.imageUrl),
      }))
    );
  }

  // ========== ABOUT METHODS ==========
  getAbout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/about`).pipe(
      map((response: any) => {
        if (response.data && response.data.profileImageUrl) {
          response.data.profileImageUrl = this.fixImageUrl(
            response.data.profileImageUrl
          );
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
