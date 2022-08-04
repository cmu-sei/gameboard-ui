import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { ConfigService } from '../../utility/config.service';
import { NotificationService } from '../../utility/notification.service';
import { UserService } from '../../utility/user.service';

@Component({
  selector: 'app-support-page',
  templateUrl: './support-page.component.html',
  styleUrls: ['./support-page.component.scss']
})
export class SupportPageComponent implements OnInit, OnDestroy {
  s: Subscription[] = [];

  constructor(
    private config: ConfigService,
    hub: NotificationService,
    user: UserService
  ) {
    this.s.push(
      user.user$.pipe(
        filter(u => !!u),
        tap(u => hub.init(u!.id, true))
      ).subscribe()
    );

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.s.forEach(s => s.unsubscribe());
  }
}
