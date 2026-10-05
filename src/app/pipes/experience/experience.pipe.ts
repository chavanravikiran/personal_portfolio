import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface Job {
  StartDate?: string;          // "YYYY-MM"
  EndDate?: string | null;     // "YYYY-MM", or empty/null for current job
  CountInExperience?: boolean; // false to exclude a job from the total
}

/**
 * Replaces {{years}} in a text with the total experience calculated
 * from the StartDate / EndDate of each job in "Experience.Jobs".
 * Usage: [innerHTML]='"Banner.Description" | translate | experience'
 */
@Pipe({
  name: 'experience'
})
export class ExperiencePipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(text: string): string {
    if (typeof text !== 'string' || !text.includes('{{years}}')) {
      return text;
    }
    const jobs = this.translate.instant('Experience.Jobs');
    return text.split('{{years}}').join(this.formatYears(Array.isArray(jobs) ? jobs : []));
  }

  private formatYears(jobs: Job[]): string {
    const months = this.totalMonths(jobs);
    const halfYears = Math.floor(months / 6) / 2; // round down to the nearest 0.5 year
    return months % 6 === 0 ? `${halfYears}` : `${halfYears}+`;
  }

  // Merges overlapping periods so a month is never counted twice
  private totalMonths(jobs: Job[]): number {
    const now = new Date();
    const currentMonth = now.getFullYear() * 12 + now.getMonth();
    const periods = jobs
      .filter(job => job.StartDate && job.CountInExperience !== false)
      .map(job => [this.toMonth(job.StartDate), job.EndDate ? this.toMonth(job.EndDate) : currentMonth])
      .sort((a, b) => a[0] - b[0]);

    let total = 0;
    let lastEnd = -Infinity;
    for (const [start, end] of periods) {
      const from = Math.max(start, lastEnd + 1);
      if (end >= from) {
        total += end - from + 1; // both start and end months are counted
        lastEnd = end;
      }
    }
    return total;
  }

  private toMonth(date: string): number {
    const [year, month] = date.split('-').map(Number);
    return year * 12 + (month - 1);
  }
}
