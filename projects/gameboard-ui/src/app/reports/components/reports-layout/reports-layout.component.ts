import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reports-layout',
  templateUrl: './reports-layout.component.html',
  styleUrls: ['./reports-layout.component.scss']
})
export class ReportsLayoutComponent implements OnDestroy {
  private routerEventsSub?: Subscription;
  protected isAtReportsRoot = false;

  constructor(private router: Router) {
    this.routerEventsSub = router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const typedEvent = ev as NavigationEnd;
        this.isAtReportsRoot = typedEvent.url.endsWith("/reports");
      }
    });
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
  }
}
