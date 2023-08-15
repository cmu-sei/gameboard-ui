import { PracticeModeSettings } from '@/prac/practice.models';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
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

  constructor(
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
      introTextPlaceholder: this.markdownHelpers.getMarkdownPlaceholderHelp(`Enter your "intro to Practice Mode" text here!`),
      settings: await firstValueFrom(this.practiceService.getSettings())
    };
  }

  handleSettingsChanged(settings: PracticeModeSettings) {
    this._startUpdate$.next(settings);
    console.log("we nexted", settings);
  }
}
