import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';

import {trigger, style, animate, transition, stagger, query } from "@angular/animations"
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { Job, totalExperienceMonths } from 'src/app/pipes/experience/experience.pipe';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  animations: [
    trigger('bannerTrigger', [
      transition(":enter", [
        query("*", [
          style({ opacity: 0, transform: "translateX(-50px)" }),
          stagger(50, [
            animate(
              "250ms cubic-bezier(0.35, 0, 0.25, 1)",
              style({ opacity: 1, transform: "none" })
            )
          ])
        ])
      ])
    ])
  ]
})
export class BannerComponent implements OnInit, OnDestroy {

  @ViewChild('typed', { static: true }) typedEl: ElementRef<HTMLElement>;

  stats: Stat[] = [];

  private roles: string[] = [];
  private roleIndex = 0;
  private charIndex = 0;
  private deleting = false;
  private timer: any;
  private sub: Subscription;
  private reduceMotion = typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(
    public analyticsService: AnalyticsService,
    private translate: TranslateService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    const keys = [
      'Banner.Roles', 'Experience.Jobs', 'FeatureProjects.Projects', 'OtherProjects.Projects',
      'Banner.Stats.Experience', 'Banner.Stats.Projects', 'Banner.Stats.Companies', 'Banner.Stats.Technologies'
    ];
    // stream() re-emits when the language changes
    this.sub = this.translate.stream(keys).subscribe(t => {
      this.buildStats(t);
      const roles = Array.isArray(t['Banner.Roles']) ? t['Banner.Roles'] : [];
      if (roles.length && roles.join() !== this.roles.join()) {
        this.roles = roles;
        this.startTyping();
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    if (this.sub) { this.sub.unsubscribe(); }
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); }
  }

  private buildStats(t: any) {
    const asArray = (v: any) => Array.isArray(v) ? v : [];
    const jobs: Job[] = asArray(t['Experience.Jobs']);
    const projects = [...asArray(t['FeatureProjects.Projects']), ...asArray(t['OtherProjects.Projects'])];

    const months = totalExperienceMonths(jobs);
    const years = Math.floor(months / 12);
    const companies = jobs.filter(j => j.CountInExperience !== false).length;
    const technologies = new Set<string>();
    projects.forEach(p => asArray(p.Technologies).forEach((tech: string) => technologies.add(tech.trim().toLowerCase())));

    this.stats = [
      { value: years, suffix: months % 12 ? '+' : '', label: t['Banner.Stats.Experience'] },
      { value: projects.length, suffix: '', label: t['Banner.Stats.Projects'] },
      { value: companies, suffix: '', label: t['Banner.Stats.Companies'] },
      { value: technologies.size, suffix: '+', label: t['Banner.Stats.Technologies'] },
    ].filter(s => s.value > 0);
  }

  // Typewriter effect. Runs outside Angular so each keystroke doesn't trigger change detection.
  private startTyping() {
    clearTimeout(this.timer);
    this.roleIndex = 0;
    this.charIndex = 0;
    this.deleting = false;

    if (this.reduceMotion) {
      this.typedEl.nativeElement.textContent = this.roles[0];
      return;
    }
    this.zone.runOutsideAngular(() => this.tick());
  }

  private tick() {
    const role = this.roles[this.roleIndex];
    this.charIndex += this.deleting ? -1 : 1;
    this.typedEl.nativeElement.textContent = role.slice(0, this.charIndex);

    let delay = this.deleting ? 40 : 85;
    if (!this.deleting && this.charIndex === role.length) {
      delay = 1800; // pause on the full word
      this.deleting = true;
    } else if (this.deleting && this.charIndex === 0) {
      this.deleting = false;
      this.roleIndex = (this.roleIndex + 1) % this.roles.length;
      delay = 300;
    }
    this.timer = setTimeout(() => this.tick(), delay);
  }
}
