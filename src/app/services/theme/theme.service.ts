import { Injectable } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly storageKey = 'theme';
  private readonly themeColors: Record<Theme, string> = { dark: '#0b1120', light: '#f8fafc' };
  private mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

  theme: Theme = 'dark';

  initTheme() {
    this.applyTheme(this.getStoredTheme() || this.getSystemTheme());

    // Follow OS changes until the user picks a theme explicitly
    this.mediaQuery.addEventListener('change', e => {
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'light' : 'dark');
      }
    });
  }

  toggleTheme() {
    const theme: Theme = this.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {}
    this.applyTheme(theme);
  }

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  private applyTheme(theme: Theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', this.themeColors[theme]);
  }

  private getStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch (e) {
      return null;
    }
  }

  private getSystemTheme(): Theme {
    return this.mediaQuery.matches ? 'light' : 'dark';
  }
}
