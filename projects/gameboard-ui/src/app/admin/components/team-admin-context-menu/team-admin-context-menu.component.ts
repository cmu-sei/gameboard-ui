import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Player } from '../../../api/player-models';
import { fa } from '@/services/font-awesome.service';
import { GameSessionService } from '../../../services/game-session.service';
import { ClipboardService } from '../../../utility/services/clipboard.service';
import { ToastService } from '../../../utility/services/toast.service';

@Component({
  selector: 'app-team-admin-context-menu',
  templateUrl: './team-admin-context-menu.component.html',
  styleUrls: ['./team-admin-context-menu.component.scss']
})
export class TeamAdminContextMenuComponent implements OnInit {
  @Input() public player!: Player;
  @Input() isViewing = false;

  @Output() onBonusManageRequest = new EventEmitter<Player>();
  @Output() onSessionResetRequest = new EventEmitter<{ player: Player, unenroll: boolean }>();
  @Output() onUnenrollRequest = new EventEmitter<Player>();
  @Output() onViewRequest = new EventEmitter<Player>();

  protected fa = fa;
  protected isResettingSession = false;

  constructor(
    private clipboardService: ClipboardService,
    private gameSessionService: GameSessionService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.isResettingSession = !this.gameSessionService.canUnenroll(this.player);
  }

  async copy(text: string, description: string) {
    await this.clipboardService.copy(text);
    this.toastService.showMessage(`Copied ${description} "${text}" to your clipboard.`);
  }
}
