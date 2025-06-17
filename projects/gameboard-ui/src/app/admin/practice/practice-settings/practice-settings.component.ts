import { CertificateTemplateView } from '@/certificates/certificates.models';
import { PracticeModeSettings } from '@/prac/practice.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PracticeService } from '@/services/practice.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime, firstValueFrom, map } from 'rxjs';

interface PracticeSettingsContext {
  settings: PracticeModeSettings;
}

@Component({
    selector: 'app-practice-settings',
    templateUrl: './practice-settings.component.html',
    styleUrls: ['./practice-settings.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class PracticeSettingsComponent implements OnInit {
  ctx: PracticeSettingsContext | null = null;

  private _startUpdate$ = new Subject<PracticeModeSettings>();

  protected errors: any = [];
  protected suggestedSearchesLineDelimited = "";

  constructor(
    private modalService: ModalConfirmService,
    private practiceService: PracticeService,
    private unsub: UnsubscriberService) {
    this.unsub.add(this._startUpdate$.pipe(
      debounceTime(500),
      map(settings => this.update(settings))
    ).subscribe()
    );
  }

  async ngOnInit(): Promise<void> {
    this.ctx = {
      settings: await firstValueFrom(this.practiceService.getSettings())
    };

    this.suggestedSearchesLineDelimited = this.ctx.settings.suggestedSearches.join("\n");
  }

  protected handleCertificateTemplateSelect(template?: CertificateTemplateView) {
    if (!this.ctx) {
      return;
    }

    this.ctx.settings.certificateTemplateId = template?.id;
    this._startUpdate$.next(this.ctx.settings);
  }

  protected handleShowSuggestedSearchesNote() {
    this.modalService.open({
      title: "About suggested searches & tags",
      bodyContent: `
        In addition to directing players to specific collections of challenges, the Suggested Searches
        feature also acts as a filter on the challenge "tags" which are displayed in the list of practice
        challenges.

        When a challenge is created, the challenge designer may optionally apply tags to it. Some tags
        are descriptive of the skills necessary to solve the challenge, while others are used for internal
        tracking only. Only tags which match values from the Suggested Searches list will be displayed
        to the player when browsing the Practice Area.
      `,
      renderBodyAsMarkdown: true
    });
  }

  protected handleSettingsChanged(settings: PracticeModeSettings) {
    settings.suggestedSearches = !this.suggestedSearchesLineDelimited ? [] : this.suggestedSearchesLineDelimited.split("\n").map(entry => entry.trim());
    if (!settings.defaultPracticeSessionLengthMinutes) {
      settings.defaultPracticeSessionLengthMinutes = 60;
    }

    this._startUpdate$.next(settings);
  }

  private async update(settings: PracticeModeSettings) {
    try {
      this.errors = [];
      await this.practiceService.updateSettings(settings);
    }
    catch (err) {
      this.errors.push(err);
    }
  }
}
