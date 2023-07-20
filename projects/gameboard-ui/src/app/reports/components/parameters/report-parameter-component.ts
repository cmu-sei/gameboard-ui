import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { isEmpty } from "@/tools/object-tools.lib";

export function createCustomInputControlValueAccessor(extendedInputComponent: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => extendedInputComponent),
        multi: true
    };
}

@Component({ template: '' })
export abstract class ReportParameterComponent<T> implements ControlValueAccessor {
    @Output() ngModelChange = new EventEmitter<T | null>;
    protected isDisabled = false;
    protected onChange = () => { };
    protected onTouched = () => { };

    private _ngModel?: T;
    public get ngModel(): T | undefined { return this._ngModel; }

    @Input() public set ngModel(value: T | undefined) {
        value = value || this.getDefaultValue();
        const bothEmpty = (isEmpty(value) && isEmpty(this._ngModel));

        if (this._ngModel !== value && !bothEmpty) {
            this.ngModelChange.emit(this._ngModel);
        }
    }

    constructor() {
        this._ngModel = this.getDefaultValue();
    }

    getDefaultValue(): T | undefined {
        return undefined;
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
