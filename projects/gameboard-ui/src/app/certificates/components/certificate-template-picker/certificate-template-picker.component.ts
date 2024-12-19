import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { CoreModule } from '@/core/core.module';
import { CertificateTemplateView } from '@/certificates/certificates.models';
import { fa } from "@/services/font-awesome.service";
import { CertificatesService } from '@/api/certificates.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
  selector: 'app-certificate-template-picker',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
  ],
  templateUrl: './certificate-template-picker.component.html',
  styleUrls: ['./certificate-template-picker.component.scss']
})
export class CertificateTemplatePickerComponent implements OnInit, OnChanges {
  @Input() defaultOptionText = "[no feedback template]";
  @Input() hideLabel = false;
  @Input() labelText = "";
  @Input() selectedTemplateId?: string;
  @Output() selected = new EventEmitter<CertificateTemplateView | undefined>();
  @ViewChild("createEditModal") createEditModal?: TemplateRef<any>;

  private certificatesService = inject(CertificatesService);
  private formBuilder = inject(FormBuilder);
  private initialLoad = false;
  private modalService = inject(ModalConfirmService);

  protected fa = fa;
  protected createEditForm = this.formBuilder.group({
    id: this.formBuilder.control(""),
    name: this.formBuilder.control("", Validators.required),
    content: this.formBuilder.control("", Validators.required)
  });
  protected selectedTemplate?: CertificateTemplateView;
  protected templates: CertificateTemplateView[] = [];

  async ngOnInit(): Promise<void> {
    if (!this.initialLoad) {
      await this.load();
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.selectedTemplateId?.currentValue && changes.selectedTemplateId.currentValue !== this.selectedTemplate?.id) {
      await this.load();
      this.selectedTemplate = this.templates.find(t => t.id === changes.selectedTemplateId.currentValue);
    }
  }

  protected handleCreate() {
    if (!this.createEditModal) {
      throw new Error("Couldn't resolve the modal template");
    }

    this.createEditForm.setValue({
      id: "",
      name: "",
      content: ""
    });

    this.modalService.openTemplate(this.createEditModal);
  }

  protected handleEdit() {
    if (!this.createEditModal) {
      throw new Error("Couldn't resolve the modal template");
    }

    if (!this.selectedTemplate) {
      throw new Error("No template selected");
    }

    this.createEditForm.setValue({
      id: this.selectedTemplate.id!,
      name: this.selectedTemplate.name,
      content: this.selectedTemplate.content
    });

    this.modalService.openTemplate(this.createEditModal);
  }

  protected async handleModalSubmit() {
    if (!this.createEditForm.valid) {
      throw new Error("Template isn't valid.");
    }

    this.modalService.hide();

    const request = {
      id: this.createEditForm.value.id,
      name: this.createEditForm.value.name || "New Certificate Template",
      content: this.createEditForm.value.content || '<div class="template"></div>'
    };
    if (!this.createEditForm.value.id) {
      await this.certificatesService.templateCreate(request);
    } else {
      await this.certificatesService.templateUpdate(request);
    }

    await this.load();

    if (this.createEditForm.value.id) {
      this.selectedTemplate = this.templates.find(t => t.id === this.createEditForm.value.id);
    }
    else {
      this.selectedTemplate = undefined;
    }
  }

  protected handleCopyFromTemplate(otherTemplateContent: string) {
    this.createEditForm.patchValue({ content: otherTemplateContent }, { emitEvent: true });
  }

  protected async handleDelete() {
    if (!this.selectedTemplate?.id) {
      throw new Error("No template selected");
    }

    await this.certificatesService.templateDelete(this.selectedTemplate.id!);
    await this.load();
  }

  protected handleTemplateSelect() {
    this.selected.emit(this.selectedTemplate);
  }

  private async load() {
    this.initialLoad = true;
    this.templates = await this.certificatesService.templateList();
  }
}
