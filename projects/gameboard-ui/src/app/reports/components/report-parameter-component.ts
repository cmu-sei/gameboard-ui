import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export function createCustomInputControlValueAccessor(extendedInputComponent: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => extendedInputComponent),
        multi: true
    };
}

@Component({ template: '' })
export abstract class ReportParameterComponent implements ControlValueAccessor {
    @Input() ngModel: any;
    @Output() ngModelChange = new EventEmitter<any>;
    private _selectedValue?: any;
    protected isDisabled = false;
    protected onChange = () => { };
    protected onTouched = () => { };

    constructor() {
        console.log("default value is", this.getDefaultValue());
        this._selectedValue = this.getDefaultValue();
    }

    public get selectedValue(): any { return this._selectedValue };
    public set selectedValue(value: any) {
        if (this._selectedValue !== value) {
            this._selectedValue = value;
            this.ngModelChange.emit(this._selectedValue);
        }
    }

    getDefaultValue(): any {
        return null;
    }

    writeValue(obj: any): void {
        this.selectedValue = obj;
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
