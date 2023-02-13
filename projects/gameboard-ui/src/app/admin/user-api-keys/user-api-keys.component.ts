import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { ApiKeyViewModel, NewApiKey } from '../../api/api-keys.models';
import { ApiKeysService } from '../../api/api-keys.service';

@Component({
  selector: 'app-user-api-keys',
  templateUrl: './user-api-keys.component.html',
  styleUrls: ['./user-api-keys.component.scss']
})
export class UserApiKeysComponent implements OnInit {
  @Input() userId!: string;

  protected errors: string[] = [];
  protected apiKeys$?: Observable<ApiKeyViewModel[]>;
  protected dummyGeneratedOn = new Date();
  protected newApiKey: NewApiKey;

  constructor(private apiKeyService: ApiKeysService) {
    this.newApiKey = this.getFormDefaults();
  }

  ngOnInit(): void {
    this.bindData();
  }

  create(newApiKey: NewApiKey) {
    this.errors = [];

    this.apiKeyService.createApiKey(newApiKey).pipe(first()).subscribe(
      r => this.bindData(),
      (err: HttpErrorResponse) => {
        this.errors = [err.message];
        this.newApiKey = this.getFormDefaults();
      }
    );
  }

  delete(keyId: string) {

  }

  private bindData() {
    this.apiKeys$ = this.apiKeyService.listUserApiKeys(this.userId);
  }

  private getFormDefaults(): NewApiKey {
    return {
      name: "",
      userId: this.userId
    };
  }
}
