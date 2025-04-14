import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-support-pill',
  standalone: true,
  imports: [
    FontAwesomeModule
  ],
  template: `
  @if (count > 0) {
    <fa-icon [icon]="faPill" class="ml-2 text-warning"></fa-icon>
  }
  `,
})
export class SupportPillComponent implements OnDestroy {
  count = 0;
  watching = false;
  faPill = faExclamationCircle;
  subs: Subscription[] = [];

  constructor(
    router: Router,
    hub: NotificationService
  ) {
    // show pill if updates come in while not watching support page
    this.subs.push(
      hub.ticketEvents.pipe(
        filter(() => !this.watching)
      ).subscribe(t => this.count += 1),

      router.events.pipe(
        filter(e => e instanceof NavigationStart),
      ).subscribe(r => {
        this.watching = !!(r as NavigationStart).url.match("/support");
        if (this.watching) {
          this.count = 0;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
