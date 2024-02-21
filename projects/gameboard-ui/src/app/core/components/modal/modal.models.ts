import { TemplateRef } from "@angular/core";

export interface ModalConfig<TComponent> {
    content: ModalContent<TComponent>;
    context: Partial<TComponent>;
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
    ignoreBackdropClick?: boolean;
    modalClasses?: string[];
    renderBodyAsMarkdown?: boolean;
    subtitle?: string;
}
