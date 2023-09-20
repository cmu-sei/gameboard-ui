import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SponsorEditFormComponent } from './components/sponsor-edit-form/sponsor-edit-form.component';
import { CoreModule } from '@/core/core.module';

@NgModule({
  declarations: [
    SponsorEditFormComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
  ],
  exports: [
    SponsorEditFormComponent
  ]
})
export class SponsorsModule { }
