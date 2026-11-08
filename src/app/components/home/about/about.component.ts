import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

interface SkillGroup {
  titleKey: string; // translation key for the group title
  icon: string;     // Font Awesome classes
  skills: string[];
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  skillGroups: SkillGroup[] = [
    {
      titleKey: 'AboutMe.Skills.Backend',
      icon: 'fas fa-server',
      skills: ['Java (8, 17, 21)', 'Spring Boot', 'Spring MVC', 'Spring Data JPA', 'Spring AOP', 'Spring Security', 'Spring AI', 'REST APIs', 'Microservices', 'WebSocket']
    },
    {
      titleKey: 'AboutMe.Skills.Frontend',
      icon: 'fas fa-laptop-code',
      skills: ['Angular', 'TypeScript', 'Angular Material', 'HTML & (S)CSS', 'JSP']
    },
    {
      titleKey: 'AboutMe.Skills.Database',
      icon: 'fas fa-database',
      skills: ['PostgreSQL', 'Oracle', 'SQL & PL/SQL']
    },
    {
      titleKey: 'AboutMe.Skills.DevOps',
      icon: 'fas fa-tools',
      skills: ['Docker', 'Jenkins', 'Git / GitHub', 'AWS', 'Render', 'Vercel', 'Neon', 'JHipster', 'Postman', 'JProfiler', 'Advanced Excel']
    }
  ];

  constructor(
    public analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
  }

}
