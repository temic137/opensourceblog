import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GithubService } from '../github.service';

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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  trendingProjects: Project[] = [];
  loading = false;

  constructor(private githubService: GithubService) {}

  async viewTrending() {
    try {
      this.loading = true;
      const projects = await this.githubService.fetchTopTrendingProjects();
      this.trendingProjects = projects.slice(0, 6);
    } catch (error) {
      console.error('Error loading trending projects:', error);
    } finally {
      this.loading = false;
    }
  }

  openGitHub(name: string) {
    const project = this.trendingProjects.find(p => p.name === name);
    if (project?.html_url) {
      window.open(project.html_url, '_blank');
    }
  }
}