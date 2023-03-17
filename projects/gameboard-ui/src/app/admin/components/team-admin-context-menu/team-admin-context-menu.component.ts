import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from '../../../api/game-models';
import { Player, TimeWindow } from '../../../api/player-models';
import { FontAwesomeService } from '../../../services/font-awesome.service';

@Component({
  selector: 'app-team-admin-context-menu',
  templateUrl: './team-admin-context-menu.component.html',
  styleUrls: ['./team-admin-context-menu.component.scss']
})
export class TeamAdminContextMenuComponent implements OnInit {
  @Input() public player!: Player;
  @Input() isViewing = false;

  @Output() onBonusManageRequest = new EventEmitter<Player>();
  @Output() onSessionResetRequest = new EventEmitter<Player>();
  @Output() onUnenrollRequest = new EventEmitter<Player>();
  @Output() onViewRequest = new EventEmitter<Player>();

  isResettingSession = false;

  constructor(protected faService: FontAwesomeService) { }

  ngOnInit(): void {
    this.isResettingSession = this.player?.session?.isBefore || true;
  }
}
