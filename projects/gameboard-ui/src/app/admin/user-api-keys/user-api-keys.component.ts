import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { faCopy, faEraser, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DateTime, Duration } from 'luxon';
import { ApiKeyViewModel, NewApiKey } from '../../api/api-keys.models';
import { ApiKeysService } from '../../api/api-keys.service';
import { ClipboardService } from 'projects/gameboard-ui/src/app/utility/services/clipboard.service';
import { ToastService } from '../../utility/services/toast.service';

@Component({
  selector: 'app-user-api-keys',
  templateUrl: './user-api-keys.component.html',
  styleUrls: ['./user-api-keys.component.scss']
})
export class UserApiKeysComponent implements OnInit, OnDestroy {
  @Input() user!: { id: string, name: string };

  protected errors: string[] = [];
  protected apiKeys$?: Observable<ApiKeyViewModel[]>;
  protected dummyGeneratedOn = new Date();
  protected minDate = new Date();
  protected newApiKey!: NewApiKey;
  protected visibleKey: string = '';

  protected clearIcon = faEraser;
  protected copyIcon = faCopy;
  protected closeIcon = faTimes;
  protected deleteIcon = faTrash;

  private apiKeysSubject$ = new Subject<void>();
  private apiKeysSub?: Subscription;

  constructor(
    private apiKeyService: ApiKeysService,
    private clipboardService: ClipboardService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.newApiKey = this.getFormDefaults();

    this.apiKeysSub = this.apiKeysSubject$.pipe(
      map(_ => this.apiKeyService.listUserApiKeys(this.user.id))
    ).subscribe(e => this.apiKeys$ = e);

    this.apiKeysSubject$.next();
  }

  copyKey(key: string) {
    this.clipboardService.copy(key);
    this.toastService.showMessage("Copied your API key to the clipboard.");
  }

  create(newApiKey: NewApiKey) {
    this.errors = [];

    this.apiKeyService.createApiKey(newApiKey).pipe(first()).subscribe(
      r => {
        this.apiKeysSubject$.next();
        this.visibleKey = r.plainKey;
      },
      (err: HttpErrorResponse) => {
        this.errors = [err.message];
      },
      () => this.newApiKey = this.getFormDefaults()
    );
  }

  delete(keyId: string) {
    this.apiKeyService.deleteApiKey(keyId).pipe(first()).subscribe(
      r => this.apiKeysSubject$.next(),
      (err: HttpErrorResponse) => {
        this.errors = [err.message];
      }
    );
  }

  ngOnDestroy(): void {
    if (this.apiKeysSub) {
      this.apiKeysSub.unsubscribe();
      this.apiKeysSub = undefined;
    }
  }

  private getFormDefaults(): NewApiKey {
    return {
      name: "",
      expiresOn: DateTime.now().plus(Duration.fromObject({ years: 1 })).toJSDate(),
      userId: this.user.id
    };
  }
}
