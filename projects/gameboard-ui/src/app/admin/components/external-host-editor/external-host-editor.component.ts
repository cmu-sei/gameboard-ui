import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-external-host-editor',
  templateUrl: './external-host-editor.component.html',
  styleUrls: ['./external-host-editor.component.scss']
})
export class ExternalHostEditorComponent implements OnInit {
  protected hostId?: string;
  protected title = "New External Game Host";

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
