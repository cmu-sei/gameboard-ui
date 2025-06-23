import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-yaml-block',
    templateUrl: './yaml-block.component.html',
    styleUrls: ['./yaml-block.component.scss'],
    standalone: false
})
export class YamlBlockComponent {
  @Input() source: any;
}
