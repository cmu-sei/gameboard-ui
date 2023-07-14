import { TemplateRef } from "@angular/core";

export interface IModalReady<TModalContext> {
    context: TModalContext;
}

export interface ModalConfig<TComponent, TContext extends Partial<TComponent>> {
    content: ModalContent<TComponent>;
    context: TContext;
    modalClasses?: string;
}

export type ModalContent<TComponent> = string | TemplateRef<any> | { new(...args: any[]): TComponent };

export interface ModalConfirmConfig {
    bodyContent: string;
    title?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    onCancel?: Function;
    onConfirm?: Function;
    hideCancel?: boolean;
    renderBodyAsMarkdown?: boolean;
}
