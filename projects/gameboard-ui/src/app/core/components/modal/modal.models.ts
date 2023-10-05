import { TemplateRef } from "@angular/core";

export interface IModalReady<TModalContext> {
    context: TModalContext;
}

export interface ModalConfig<TComponent, TContext> {
    content: ModalContent<TComponent>;
    context: TContext;
    modalClasses?: string[];
    isBackdropStatic?: boolean;
    ignoreBackdropClick?: boolean;
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
    modalClasses?: string[];
    renderBodyAsMarkdown?: boolean;
}
