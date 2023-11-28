import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnityBoardComponent } from './unity-board/unity-board.component';
import { UtilityModule } from '../utility/utility.module';
import { CoreModule } from '@/core/core.module';

@NgModule({
  declarations: [
    UnityBoardComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    UtilityModule
  ],
  exports: [UnityBoardComponent]
})
export class UnityModule { }
