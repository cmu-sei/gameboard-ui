import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { SupportSettings } from '@/api/support-models';
import { SupportService } from '@/api/support.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ConfigService } from '@/utility/config.service';

@Component({
    selector: 'app-support-settings',
    templateUrl: './support-settings.component.html',
    styleUrls: ['./support-settings.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class SupportSettingsComponent implements OnInit {
  protected appName: string;
  protected placeholder = "Welcome to Support!";
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
    this.load();
  }

  protected async handleSettingsChanged() {
    if (this.settings)
      this.update$.next(this.settings);
  }

  private async load() {
    this.settings = await firstValueFrom(this.supportService.getSettings());
  }
}
