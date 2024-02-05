import { Component, OnInit } from '@angular/core';
import { Observable, Subject, firstValueFrom, startWith, switchMap } from 'rxjs';
import { AdminViewSystemNotification } from '@/system-notifications/system-notifications.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { CreateEditSystemNotificationModalComponent, CreatedEditSystemNotificationModalContext } from '../create-edit-system-notification-modal/create-edit-system-notification-modal.component';
import { SystemNotificationsService } from '@/system-notifications/system-notifications.service';
import { AppTitleService } from '@/services/app-title.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './admin-system-notifications.component.html',
  styleUrls: ['./admin-system-notifications.component.scss'],
  providers: [UnsubscriberService]
})
export class AdminSystemNotificationsComponent implements OnInit {
  private _forceLoad$ = new Subject<boolean>();
  protected notifications$: Observable<AdminViewSystemNotification[]>;

  constructor(
    private appTitleService: AppTitleService,
    private modalService: ModalConfirmService,
    private systemNotificationsService: SystemNotificationsService,
    private unsub: UnsubscriberService) {

    this.notifications$ = this._forceLoad$.pipe(
      startWith(true),
      switchMap(() => this.systemNotificationsService.getAllNotifications())
    );

    this.unsub.add(
      this.notifications$.subscribe()
    );
  }

  ngOnInit(): void {
    this.appTitleService.set("System Notifications | Admin");
    this._forceLoad$.next(true);
  }

  protected handleCreateNotificationClick() {
    this.modalService.openComponent<CreateEditSystemNotificationModalComponent>({
      content: CreateEditSystemNotificationModalComponent,
      context: {
        context: {
          model: {
            markdownContent: "",
            notificationType: "generalInfo",
            title: ""
          },
          onSave: () => this._forceLoad$.next(true)
        }
      }
    });
  }

  protected handleEditNotificationClick(notification: AdminViewSystemNotification) {
    this.modalService.openComponent<CreateEditSystemNotificationModalComponent>({
      content: CreateEditSystemNotificationModalComponent,
      context: {
        context: {
          model: { ...notification },
          onSave: () => this._forceLoad$.next(true)
        }
      }
    });
  }

  protected async handleDelete(id: string) {
    await firstValueFrom(this.systemNotificationsService.deleteNotification(id));
    this._forceLoad$.next(true);
  }
}
