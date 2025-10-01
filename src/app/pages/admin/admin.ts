import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Auth } from '../../services/auth';
import { GetServices } from '../../services/get-services';
import { AdminService } from '../../services/admin-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  // Dashboard state
  activeTab = 'overview';
  isLoading = false;
  message = '';

  // Data arrays
  skills: any[] = [];
  projects: any[] = [];
  contacts: any[] = [];
  aboutInfo: any = null;

  // Forms
  skillForm: FormGroup;
  projectForm: FormGroup;
  aboutForm: FormGroup;

  // Edit modes
  editingSkill: any = null;
  editingProject: any = null;

  // File upload
  selectedFile: File | null = null;

  constructor(
    private auth: Auth,
    private getServices: GetServices,
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Initialize forms
    this.skillForm = this.formBuilder.group({
      name: ['', Validators.required],
      level: ['', [Validators.required]], // Changed to string to match backend
      category: ['', Validators.required],
      iconUrl: [''], // Added iconUrl field
    });

    this.projectForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      technologies: [''],
      imageUrl: [''], // Changed from projectUrl to imageUrl to match backend
      link: [''], // Changed from githubUrl to link to match backend
    });

    this.aboutForm = this.formBuilder.group({
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadAllData();
  }

  // Get current user info
  getCurrentUser() {
    return this.auth.getCurrentUser();
  }

  // Load all dashboard data
  loadAllData() {
    this.loadSkills();
    this.loadProjects();
    this.loadContacts();
    this.loadAbout();
  }

  // Navigation methods
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.message = '';
  }

  // Logout with confirmation
  logout() {
    const confirmLogout = confirm(
      'Are you sure you want to logout? All session data will be cleared.'
    );
    if (confirmLogout) {
      console.log('Admin logout initiated');
      this.auth.forceLogout();
    }
  }

  // Handle image loading errors
  onImageError(event: any) {
    console.log('Image failed to load:', event.target.src);
    event.target.style.display = 'none';
  }

  // SKILLS MANAGEMENT
  loadSkills() {
    this.isLoading = true;
    this.getServices.getSkills().subscribe({
      next: (response) => {
        console.log('Skills response:', response);
        // Handle different response formats from backend
        if (response.success) {
          this.skills = response.skills || response.data || [];
        } else {
          this.skills = response || [];
        }
        this.isLoading = false;
        console.log('Loaded skills:', this.skills);
      },
      error: (error) => {
        console.error('Error loading skills:', error);
        this.message =
          'Error loading skills: ' + (error.error?.message || error.message);
        this.isLoading = false;
      },
    });
  }

  onSubmitSkill() {
    if (this.skillForm.valid) {
      this.isLoading = true;
      const skillData = this.skillForm.value;

      if (this.editingSkill) {
        // Update existing skill
        this.adminService
          .updateSkill(this.editingSkill._id, skillData)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              this.message = 'Skill updated successfully!';
              this.loadSkills();
              this.resetSkillForm();
            },
            error: (error) => {
              this.isLoading = false;
              this.message = 'Error updating skill: ' + error.error?.message;
            },
          });
      } else {
        // Create new skill
        this.adminService.createSkill(skillData).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.message = 'Skill created successfully!';
            this.loadSkills();
            this.resetSkillForm();
          },
          error: (error) => {
            this.isLoading = false;
            this.message = 'Error creating skill: ' + error.error?.message;
          },
        });
      }
    }
  }

  editSkill(skill: any) {
    this.editingSkill = skill;
    this.skillForm.patchValue({
      name: skill.name,
      level: skill.level,
      category: skill.category,
      iconUrl: skill.iconUrl || '',
    });
  }

  deleteSkill(skillId: string) {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.adminService.deleteSkill(skillId).subscribe({
        next: (response) => {
          this.message = 'Skill deleted successfully!';
          this.loadSkills();
        },
        error: (error) => {
          this.message = 'Error deleting skill: ' + error.error?.message;
        },
      });
    }
  }

  resetSkillForm() {
    this.skillForm.reset();
    this.editingSkill = null;
  }

  // PROJECTS MANAGEMENT
  loadProjects() {
    this.isLoading = true;
    this.getServices.getProjects().subscribe({
      next: (response) => {
        console.log('Projects response:', response);
        // Handle different response formats from backend
        if (response.success) {
          this.projects = response.allProjects || response.data || [];
        } else {
          this.projects = response || [];
        }
        this.isLoading = false;
        console.log('Loaded projects:', this.projects);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.message =
          'Error loading projects: ' + (error.error?.message || error.message);
        this.isLoading = false;
      },
    });
  }

  onSubmitProject() {
    if (this.projectForm.valid) {
      this.isLoading = true;
      const projectData = {
        ...this.projectForm.value,
        technologies: this.projectForm.value.technologies
          .split(',')
          .map((t: string) => t.trim()),
      };

      if (this.editingProject) {
        // Update existing project
        this.adminService
          .updateProject(this.editingProject._id, projectData)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              this.message = 'Project updated successfully!';
              this.loadProjects();
              this.resetProjectForm();
            },
            error: (error) => {
              this.isLoading = false;
              this.message = 'Error updating project: ' + error.error?.message;
            },
          });
      } else {
        // Create new project
        this.adminService.createProject(projectData).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.message = 'Project created successfully!';
            this.loadProjects();
            this.resetProjectForm();
          },
          error: (error) => {
            this.isLoading = false;
            this.message = 'Error creating project: ' + error.error?.message;
          },
        });
      }
    }
  }

  editProject(project: any) {
    this.editingProject = project;
    this.projectForm.patchValue({
      title: project.title,
      description: project.description,
      technologies: project.technologies?.join(', ') || '',
      imageUrl: project.imageUrl || '',
      link: project.link || '',
    });
  }

  deleteProject(projectId: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.adminService.deleteProject(projectId).subscribe({
        next: (response) => {
          this.message = 'Project deleted successfully!';
          this.loadProjects();
        },
        error: (error) => {
          this.message = 'Error deleting project: ' + error.error?.message;
        },
      });
    }
  }

  resetProjectForm() {
    this.projectForm.reset();
    this.editingProject = null;
  }

  // contact MANAGEMENT
  loadContacts() {
    this.adminService.getContacts().subscribe({
      next: (response) => {
        console.log('Contacts response:', response);
        // Handle different response formats from backend
        if (response.success) {
          this.contacts = response.contacts || response.data || [];
        } else {
          this.contacts = response || [];
        }
        console.log('Loaded contacts:', this.contacts);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.message =
          'Error loading contacts: ' + (error.error?.message || error.message);
      },
    });
  }

  deleteContact(contactId: string) {
    if (confirm('Are you sure you want to delete this contact message?')) {
      this.adminService.deleteContact(contactId).subscribe({
        next: (response) => {
          this.message = 'Contact message deleted successfully!';
          this.loadContacts(); // Reload the contacts list
        },
        error: (error) => {
          this.message =
            'Error deleting contact: ' +
            (error.error?.message || error.message);
        },
      });
    }
  }

  // mangement about
  loadAbout() {
    this.getServices.getAbout().subscribe({
      next: (response) => {
        this.aboutInfo = response.data;
        if (this.aboutInfo) {
          this.aboutForm.patchValue({
            description: this.aboutInfo.description,
          });
        }
      },
      error: (error) => {
        console.error('Error loading about info:', error);
      },
    });
  }

  onSubmitAbout() {
    if (this.aboutForm.valid) {
      this.isLoading = true;
      this.adminService.updateAbout(this.aboutForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = 'About information updated successfully!';
          this.loadAbout();
        },
        error: (error) => {
          this.isLoading = false;
          this.message = 'Error updating about: ' + error.error?.message;
        },
      });
    }
  }

  // FILE UPLOAD
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadProfileImage() {
    if (this.selectedFile) {
      this.isLoading = true;
      this.adminService.uploadAboutImage(this.selectedFile).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = 'Profile image uploaded successfully!';
          this.loadAbout();
          this.selectedFile = null;
        },
        error: (error) => {
          this.isLoading = false;
          this.message = 'Error uploading image: ' + error.error?.message;
        },
      });
    }
  }
}
