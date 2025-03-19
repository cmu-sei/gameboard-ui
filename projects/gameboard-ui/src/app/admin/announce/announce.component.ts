// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, Input } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom } from 'rxjs';
import { LogService } from '@/services/log.service';
import { ToastService } from '@/utility/services/toast.service';
import { AdminService } from '@/api/admin.service';

@Component({
  selector: 'app-announce',
  templateUrl: './announce.component.html',
  styleUrls: ['./announce.component.scss']
})
export class AnnounceComponent {
  @Input() teamId = '';
  @Input() placeholderText = "We'd like to inform everyone playing that...";

  private adminService = inject(AdminService);
  private logService = inject(LogService);
  private toastService = inject(ToastService);

  message = '';
  faSend = faPaperPlane;
  errors: any[] = [];
  protected finalPlaceholder = "";
  protected isLoading = false;

  async announce(): Promise<void> {
    if (!this.message) {
      return;
    }

    try {
      await firstValueFrom(this.adminService.sendAnnouncement({
        contentMarkdown: this.message,
        teamId: this.teamId
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
