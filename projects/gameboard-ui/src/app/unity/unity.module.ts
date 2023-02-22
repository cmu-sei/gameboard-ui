import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnityBoardComponent } from './unity-board/unity-board.component';
import { UtilityModule } from '../utility/utility.module';

@NgModule({
  declarations: [
    UnityBoardComponent
  ],
  imports: [CommonModule, UtilityModule],
  exports: [UnityBoardComponent]
})
export class UnityModule { }
