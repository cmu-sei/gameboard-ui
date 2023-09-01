import { Component, EventEmitter, Injectable, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { v4 as uuid4 } from 'uuid';

export function createCustomInputControlValueAccessor(extendedInputComponent: any) {
  return {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => extendedInputComponent),
    multi: true,
  };
}

@Component({ template: '' })
@Injectable({ providedIn: 'root' })
export abstract class CustomInputComponent<T> implements ControlValueAccessor {
  @Output() ngModelChange = new EventEmitter<T | null>();
  protected isDisabled = false;
  protected onChange = () => { };
  protected onTouched = () => { };

  protected _ngModel: T | null = null;
  public get ngModel(): T | null {
    return this._ngModel;
  }
  @Input() public set ngModel(value: T | null) {
    if (this._ngModel !== value) {
      this._ngModel = value;
      this.ngModelChange.emit(this._ngModel);
    }
  }

  // generate a uniqueId so if the custom component needs to generate
  // say, a list of things, it can use the unique id of the component
  // to ensure page ids/names are unique
  protected uniqueId = uuid4();

  protected updateNgModel(updates: Partial<T>) {
    this.ngModel = { ...this.ngModel, ...updates } as T;
  }

  protected getDefaultValue(): T | null {
    return null;
  }

  writeValue(obj: any): void {
    this.ngModel = obj;
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
