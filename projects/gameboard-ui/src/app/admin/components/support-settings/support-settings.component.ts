import { SupportSettings } from '@/api/support-models';
import { SupportService } from '@/api/support.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ConfigService } from '@/utility/config.service';
import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-support-settings',
  templateUrl: './support-settings.component.html',
  styleUrls: ['./support-settings.component.scss'],
  providers: [UnsubscriberService]
})
export class SupportSettingsComponent implements OnInit {
  protected appName: string;
  protected settings?: SupportSettings;
  private update$ = new Subject<SupportSettings>();

  constructor(
    config: ConfigService,
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
    this.settings = await firstValueFrom(this.supportService.getSettings());
  }

  protected async handleSettingsChanged() {
    if (this.settings)
      this.update$.next(this.settings);
  }
}
