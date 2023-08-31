import { PracticeModeSettings } from '@/prac/practice.models';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PracticeService } from '@/services/practice.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime, firstValueFrom, map, of, tap } from 'rxjs';

interface PracticeSettingsContext {
  introTextPlaceholder: string;
  settings: PracticeModeSettings;
}

@Component({
  selector: 'app-practice-settings',
  templateUrl: './practice-settings.component.html',
  styleUrls: ['./practice-settings.component.scss']
})
export class PracticeSettingsComponent implements OnInit {
  ctx: PracticeSettingsContext | null = null;

  private _startUpdate$ = new Subject<PracticeModeSettings>();
  protected certificateHtmlPlaceholder = [
    "Enter an HTML template here which will be used to create certificates for the Practice Area. For each challenge they fully solve, players will be able to print a PDF of this certificate.",
    "You can use several variables to display information about the player's performance on the challenge by including these \"magic strings\" in your template.They include: ",
    `
      - {{playerName}} - The player's approved username

      - {{score}} - The player's score on the challenge

      - {{date}} - The date the player completed the challenge

      - {{challengeName}} - The name of the challenge

      - {{season}} - The season the challenge was originally played in competitive mode

      - {{track}} - The track upon which the challenge was originally placed in competitive mode
      
      - {{time}} - The amount of time the player spent solving the challenge
    `
  ].join("\n\n");

  constructor(
    private modalService: ModalConfirmService,
    private markdownHelpers: MarkdownHelpersService,
    private practiceService: PracticeService,
    private unsub: UnsubscriberService) {
    this.unsub.add(this._startUpdate$.pipe(
      debounceTime(500),
      map(settings => this.practiceService.updateSettings(settings))
    ).subscribe());
  }

  async ngOnInit(): Promise<void> {
    this.ctx = {
      introTextPlaceholder: this.markdownHelpers.getMarkdownPlaceholderHelp(`Enter your "intro to the Practice Area" text here!`),
      settings: await firstValueFrom(this.practiceService.getSettings())
    };
  }

  handleShowCertificateTemplateHelp() {
    this.modalService.open({
      title: "Creating a certificate template",
      bodyContent: this.certificateHtmlPlaceholder,
      modalClasses: ["modal-lg", "modal-dialog-centered"],
      renderBodyAsMarkdown: true
    });
  }

  handleSettingsChanged(settings: PracticeModeSettings) {
    this._startUpdate$.next(settings);
  }
}
