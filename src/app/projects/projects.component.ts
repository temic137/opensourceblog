import { Component, OnInit } from '@angular/core';
import { GithubService } from '../github.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { RouterLink } from '@angular/router';

interface Project {
  name: string;
  description: string;
  license?: string;
  html_url?: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  image_url?: string; 
  owner?: {
    avatar_url: string; 
  };
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterLink],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  page = 1;
  query = '';
  license = '';
  loading = false;
  private searchSubject = new Subject<string>();

  constructor(private githubService: GithubService) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  async ngOnInit() {
    await this.fetchProjects();
  }

  searchProjects(query: string) {
    this.searchSubject.next(query);
  }

  private async performSearch(query: string) {
    this.query = query;
    this.page = 1;
    await this.fetchProjects();
  }

  async filterByLicense(license: string) {
    this.license = license;
    this.page = 1;
    await this.fetchProjects();
  }

  async loadMore() {
    this.page += 1;
    await this.fetchProjects(true);
  }
  private async fetchProjects(append = false) {
    try {
      this.loading = true;
      let result;
  
      if (this.query) {
        result = await this.githubService.searchProjects(this.query, this.license, this.page);
      } else if (this.license) {
        result = await this.githubService.fetchProjectsByLicense(this.license, this.page);
      } else {
        result = await this.githubService.fetchAllProjects(this.page);
      }
  
      if (result) {
        // Map license to a readable string
        const processedResult = result.map((project: any) => ({
          ...project,
          license: project.license?.name || 'N/A'
        }));
  
        this.projects = append ? [...this.projects, ...processedResult] : processedResult;
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      this.loading = false;
    }
  }
  
}