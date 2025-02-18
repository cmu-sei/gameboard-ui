import { Component, Input } from '@angular/core';
import { CoreModule } from '@/core/core.module';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-session-extension-game-end-warning',
  standalone: true,
  styleUrl: './session-extension-game-end-warning.component.scss',
  template: `
  <ng-container *ngIf="sessionEnd && gameEnd && extensionInMinutes && (sessionEnd | datetimeIsFuture)">
    <alert type="danger" *ngIf="(sessionEnd | addDuration:{ minutes: extensionInMinutes }) > gameEnd">
        <h3>Warning</h3>

        <p>
            This game ends at <strong>{{ gameEnd | friendlyDateAndTime }}</strong>. This extension will
            cause one or more sessions to extend past that time. When the game ends, any players without
            permission to play outside the execution period will become unable to submit answers.
        </p>

        <p class="mt-2">
            If you have unprivileged players active, be sure to change the game end date to at least
            <strong>
                {{ sessionEnd | addDuration:{ minutes: extensionInMinutes } | friendlyDateAndTime }}
            </strong>
            (or later) to allow them to finish playing.
        </p>
    </alert>
</ng-container>
`,
  imports: [CoreModule],
})
export class SessionExtensionGameEndWarningComponent {
  @Input() extensionInMinutes = 0;
  @Input() gameEnd?: DateTime;
  @Input() sessionEnd?: DateTime;
}
