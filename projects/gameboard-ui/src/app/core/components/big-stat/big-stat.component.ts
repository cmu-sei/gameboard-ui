import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-big-stat',
  templateUrl: './big-stat.component.html',
  styleUrls: ['./big-stat.component.scss']
})
export class BigStatComponent {
  @Input() label = "";
  @Input() value = "";
  @Input() subLabel = "";
  @Input() isClickable = false;
}
