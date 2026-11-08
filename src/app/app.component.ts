import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import * as AOS from 'aos';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import {LanguageService} from "src/app/services/language/language.service"
import { ThemeService } from "src/app/services/theme/theme.service";
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'ravikiran-portfolio';

  @ViewChild('progressBar', { static: true }) progressBar: ElementRef<HTMLElement>;
  @ViewChild('backToTop', { static: true }) backToTop: ElementRef<HTMLElement>;

  private ticking = false;
  private onScroll = () => {
    // Batch scroll updates into one per frame
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        this.updateScrollUi();
        this.ticking = false;
      });
    }
  };

  constructor(
    private zone: NgZone,
    private titleService: Title,
    private metaService: Meta,
    private translateService: TranslateService,
    private location: Location,
    private languageService: LanguageService,
    private themeService: ThemeService
    ){
    }
  ngOnInit(): void{

    this.languageService.initLanguage()
    this.themeService.initTheme()


    this.titleService.setTitle( "Ravikiran Chavan | Software Developer" );

    this.metaService.addTags([
      {name: 'keywords', content: 'Software, developer,Frontend' },
      {name: 'description', content: 'I have 3 Year experience in Software Design.'},
    ]);
    
    
    AOS.init();

    // Scroll listener runs outside Angular so scrolling doesn't trigger change detection
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });
    this.updateScrollUi();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateScrollUi() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    this.progressBar.nativeElement.style.transform = `scaleX(${progress})`;
    this.backToTop.nativeElement.classList.toggle('visible', window.scrollY > 600);
  }
}
