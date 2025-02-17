import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { SupportSettings } from '@/api/support-models';
import { SupportService } from '@/api/support.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ConfigService } from '@/utility/config.service';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';

@Component({
  selector: 'app-support-settings',
  templateUrl: './support-settings.component.html',
  styleUrls: ['./support-settings.component.scss'],
  providers: [UnsubscriberService]
})
export class SupportSettingsComponent implements OnInit {
  protected appName: string;
  protected placeholder = "Welcome to Support!";
  protected settings?: SupportSettings;
  private update$ = new Subject<SupportSettings>();

  constructor(
    config: ConfigService,
    private markdownHelpers: MarkdownHelpersService,
    private supportService: SupportService,
    private unsub: UnsubscriberService) {
    // use the app name to personalize the placeholder
    this.appName = config.appName;

    // debounce input on the big textboxes
    this.unsub.add(
      this.update$.pipe(
        debounceTime(500)
      ).subscribe(async update => {
        await firstValueFrom(this.supportService.updateSettings(update));
      })
    );
  }

  async ngOnInit(): Promise<void> {
    this.load();
    this.placeholder = this.markdownHelpers.getMarkdownPlaceholderHelp(`Welcome to ${this.appName} Support!`);
  }

  protected async handleSettingsChanged() {
    if (this.settings)
      this.update$.next(this.settings);
  }

  private async load() {
    this.settings = await firstValueFrom(this.supportService.getSettings());
  }
}
