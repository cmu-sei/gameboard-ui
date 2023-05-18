import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import { faPen, faPlusSquare, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-inplace-editor',
  templateUrl: './inplace-editor.component.html',
  styleUrls: ['./inplace-editor.component.scss']
})
export class InplaceEditorComponent {
  @ViewChild('input') input!: ElementRef;

  @Input() editData!: EditData;
  @Input() noEdit = false;
  @Input() currentText = "";
  @Output() startEditFunc = new EventEmitter<boolean>();
  @Output() selectOptionFunc = new EventEmitter<SuggestionOption>();
  faPlusSquare = faPlusSquare;
  faTimes = faTimes;
  faPen = faPen;

  startEditing() {
    if (!this.noEdit) {
      this.startEditFunc.emit(true);
      setTimeout(() => {
        this.input?.nativeElement?.focus();
      }, 10);
    }
  }

  selectOption(option: SuggestionOption) {
    if (!this.noEdit)
      this.selectOptionFunc.emit(option);
  }
}


export interface EditData {
  isEditing: boolean;
  loaded: boolean;
  allOptions: SuggestionOption[];
  filteredOptions: SuggestionOption[];
  filtering$: Subject<string>;
}

export interface SuggestionOption {
  name: string;
  secondary: string;
  data: any;
}
