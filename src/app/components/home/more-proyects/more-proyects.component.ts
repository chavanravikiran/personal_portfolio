import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-more-proyects',
  templateUrl: './more-proyects.component.html',
  styleUrls: ['./more-proyects.component.scss']
})
export class MoreProyectsComponent implements OnInit {

  selected: any;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    public analyticsService: AnalyticsService
    ) { }

    ngOnInit() {
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0)
        });
    }
    openDetails(project: any, template: TemplateRef<any>) {
      this.selected = project;
      this.analyticsService.sendAnalyticEvent("click_project_details", "proyects", "click");
      this.modalService.open(template, { centered: true, size: 'lg', scrollable: true, windowClass: 'project-modal' });
    }

}
