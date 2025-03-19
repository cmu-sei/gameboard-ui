import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@/core/core.module';
import { SponsorEditFormComponent } from './components/sponsor-edit-form/sponsor-edit-form.component';
import { SponsorEditModalComponent } from './components/sponsor-edit-modal/sponsor-edit-modal.component';
import { SponsorSelectComponent } from './components/sponsor-select/sponsor-select.component';
import { SponsorWithChildrenPickerComponent } from './components/sponsor-with-children-picker/sponsor-with-children-picker.component';
import { SponsorAdminEntryComponent } from './components/sponsor-admin-entry/sponsor-admin-entry.component';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';

const DECLARATIONS = [
  SponsorEditFormComponent,
  SponsorEditModalComponent,
  SponsorSelectComponent,
  SponsorWithChildrenPickerComponent,
  SponsorAdminEntryComponent,
];

@NgModule({
  declarations: DECLARATIONS,
  imports: [
    CommonModule,
    CoreModule,

    // standalones
    ErrorDivComponent,
    SpinnerComponent
  ],
  exports: DECLARATIONS
})
export class SponsorsModule { }
