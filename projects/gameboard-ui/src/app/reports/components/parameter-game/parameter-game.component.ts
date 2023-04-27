import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { Observable } from 'rxjs';
import { SimpleEntity } from '../../../api/models';
import { ReportsService } from '../../reports.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-parameter-game',
  templateUrl: './parameter-game.component.html',
  styleUrls: ['./parameter-game.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ParameterGameComponent),
      multi: true,
    }
  ]
})
export class ParameterGameComponent implements ControlValueAccessor {
  @Input() ngModel?: string;
  @Output() ngModelChange = new EventEmitter<string>();
  games$: Observable<SimpleEntity[]>
  private _selectedGameId?: string;

  public get selectedGameId(): string | undefined { return this._selectedGameId; }
  public set selectedGameId(value: string | undefined) {
    if (this._selectedGameId !== value) {
      this._selectedGameId = value;
      this.ngModelChange.emit(this._selectedGameId);
    }
  }

  protected isDisabled = false;
  protected onChange = () => { };
  protected onTouched = () => { };

  constructor(private reportsService: ReportsService) {
    this.games$ = this.reportsService.getGameOptions();
  }

  writeValue(obj: any): void {
    this.selectedGameId = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
