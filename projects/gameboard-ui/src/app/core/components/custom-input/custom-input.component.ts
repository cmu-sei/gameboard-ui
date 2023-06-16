import { Component, EventEmitter, Input, Output, forwardRef, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export function createCustomInputControlValueAccessor(extendedInputComponent: any) {
  return {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => extendedInputComponent),
    multi: true,
  };
}

@Component({ template: '' })
export abstract class CustomInputComponent<T> implements ControlValueAccessor {
  @Output() ngModelChange = new EventEmitter<T>();
  protected isDisabled = false;
  protected onChange = () => { };
  protected onTouched = () => { };

  private _ngModel?: T;
  public get ngModel(): T | undefined {
    return this._ngModel;
  }
  @Input() public set ngModel(value: T | undefined) {
    if (this._ngModel !== value) {
      this._ngModel = value;
      this.ngModelChange.emit(this._ngModel);
    }
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
