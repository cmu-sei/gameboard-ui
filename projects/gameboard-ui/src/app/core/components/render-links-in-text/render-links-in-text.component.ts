import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-render-links-in-text',
    templateUrl: './render-links-in-text.component.html',
    styleUrls: ['./render-links-in-text.component.scss'],
    standalone: false
})
export class RenderLinksInTextComponent {
  @Input() text: string = '';
}
