import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@/core/core.module';
import { SponsorEditFormComponent } from './components/sponsor-edit-form/sponsor-edit-form.component';
import { SponsorSelectComponent } from './components/sponsor-select/sponsor-select.component';
import { SponsorWithChildrenPickerComponent } from './components/sponsor-with-children-picker/sponsor-with-children-picker.component';

@NgModule({
  declarations: [
    SponsorEditFormComponent,
    SponsorSelectComponent,
    SponsorWithChildrenPickerComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
  ],
  exports: [
    SponsorEditFormComponent,
    SponsorSelectComponent,
    SponsorWithChildrenPickerComponent,
  ]
})
export class SponsorsModule { }
