// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../api/user.service';
import { firstValueFrom } from 'rxjs';
import { LogService } from '@/services/log.service';
import { ToastService } from '@/utility/services/toast.service';

@Component({
  selector: 'app-announce',
  templateUrl: './announce.component.html',
  styleUrls: ['./announce.component.scss']
})
export class AnnounceComponent {
  @Input() teamId = '';
  @Input() placeholderText = "We'd like to inform everyone playing that...";

  message = '';
  faSend = faPaperPlane;
  errors: any[] = [];

  protected isLoading = false;

  constructor(
    private api: UserService,
    private logService: LogService,
    private toastService: ToastService) { }

  async announce(): Promise<void> {
    if (!this.message) {
      return;
    }

    try {
      await firstValueFrom(this.api.announce({
        teamId: this.teamId,
        message: this.message
      }));

      this.message = "";
      this.toastService.showMessage("Announcement sent.");
    }
    catch (err: any) {
      this.logService.logError("Error sending announcement", err);
      this.errors.push(err);
    }
  }
}
