// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { LogService } from '@/services/log.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SponsorSelectModalComponent } from './components/sponsor-select-modal/sponsor-select-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private localUser: LocalUserService,
    private logService: LogService,
    private modalService: ModalConfirmService,
    private unsub: UnsubscriberService) {
    this.unsub.add(this.localUser.user$.subscribe(u => {
      if (u && !u.sponsor) {
        this.logService.logInfo(`User ${u.name} has no sponsor; popping sponsor select.`);
        this.modalService.openComponent({
          content: SponsorSelectModalComponent,
          context: null,
          isBackdropStatic: true,
          modalClasses: ["modal-xl", "modal-dialog-centered"]
        });
      } else {
        this.logService.logInfo(`User ${u?.name} is either unauthed or has a sponsor, so no sponsor select fired.`);
      }
    }));
  }
}
