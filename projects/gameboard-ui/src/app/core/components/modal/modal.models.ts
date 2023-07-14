import { TemplateRef } from "@angular/core";
import { ModalConfirmComponent } from "./modal-confirm.component";

export interface IModalReady<T> {
    // constructor: (new (...args: any[]) => T);
    config: Partial<T>;
}

export interface ModalComponentConfig<T> {
    templateRef: TemplateRef<T>,
    context: T;
}

export interface ModalConfirmConfig extends Partial<ModalConfirmComponent> {
    bodyContent: string;
    title?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    onCancel?: Function;
    onConfirm?: Function;
    hideCancel?: boolean;
    renderBodyAsMarkdown?: boolean;
}
