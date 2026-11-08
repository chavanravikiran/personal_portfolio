import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Job {
  StartDate?: string;          // "YYYY-MM"
  EndDate?: string | null;     // "YYYY-MM", or empty/null for current job
  CountInExperience?: boolean; // false to exclude a job from the total
}

const UNITS: { [lang: string]: { year: string; years: string; month: string; months: string } } = {
  en: { year: 'year', years: 'years', month: 'month', months: 'months' },
  es: { year: 'वर्ष', years: 'वर्ष', month: 'महीना', months: 'महीने' } // es.json holds Hindi text
};

/**
 * Replaces {{experience}} in a text with the total experience (e.g. "4 years 7 months")
 * calculated from the StartDate / EndDate of each job in "Experience.Jobs".
 * Updates automatically every month based on today's date.
 * Usage: [innerHTML]='"Banner.Description" | translate | experience'
 */
@Pipe({
  name: 'experience'
})
export class ExperiencePipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(text: string): string {
    if (typeof text !== 'string' || !text.includes('{{experience}}')) {
      return text;
    }
    const jobs = this.translate.instant('Experience.Jobs');
    return text.split('{{experience}}').join(this.formatExperience(Array.isArray(jobs) ? jobs : []));
  }

  private formatExperience(jobs: Job[]): string {
    const total = this.totalMonths(jobs);
    const years = Math.floor(total / 12);
    const months = total % 12;
    const u = UNITS[this.translate.currentLang] || UNITS.en;

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? u.year : u.years}`);
    }
    if (months > 0 || years === 0) {
      parts.push(`${months} ${months === 1 ? u.month : u.months}`);
    }
    return parts.join(' ');
  }

  private totalMonths(jobs: Job[]): number {
    return totalExperienceMonths(jobs);
  }
}

/** Total months worked across all jobs; overlapping periods are merged so a month is never counted twice. */
export function totalExperienceMonths(jobs: Job[]): number {
  const toMonth = (date: string) => {
    const [year, month] = date.split('-').map(Number);
    return year * 12 + (month - 1);
  };
  const now = new Date();
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  const periods = (jobs || [])
    .filter(job => job.StartDate && job.CountInExperience !== false)
    .map(job => [toMonth(job.StartDate), job.EndDate ? toMonth(job.EndDate) : currentMonth])
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
