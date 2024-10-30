import { SimpleEntity } from '@/api/models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component } from '@angular/core';

@Component({
  template: `
    <div class="modal-confirm-component">
      <div class="modal-header">
          <div class="titles-container">
            <h4 class="modal-title pull-left">{{ team?.name }}</h4>
            <h5 class="text-muted">Challenge Timeline: {{game?.name}}</h5>
          </div>
          <button type="button" class="btn-close close pull-right" aria-label="Close" (click)="close()">
              <span aria-hidden="true" class="visually-hidden">&times;</span>
          </button>
      </div>
      <div class="modal-body" *ngIf="team?.id">
        <app-team-event-horizon [teamId]="team?.id"></app-team-event-horizon>
      </div>
      <div class="modal-footer">
          <button type="button" class="btn btn-info" (click)="close()">OK</button>
      </div>
    </div>
`,
  selector: 'app-event-horizon-modal',
  styleUrls: ['./event-horizon-modal.component.scss']
})
export class EventHorizonModalComponent {
  team?: SimpleEntity;
  game?: SimpleEntity;

  constructor(private modalService: ModalConfirmService) { }

  protected close() {
    this.modalService.hide();
  }
}
