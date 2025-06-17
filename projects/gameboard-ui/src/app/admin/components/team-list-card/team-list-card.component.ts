import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PlayerWithSponsor } from '@/api/models';

export type TeamListCardContext = {
  id: string;
  captain: PlayerWithSponsor;
  name: string;
  players: PlayerWithSponsor[];
  rank?: number;
}

@Component({
    selector: 'app-team-list-card',
    templateUrl: './team-list-card.component.html',
    styleUrls: ['./team-list-card.component.scss'],
    standalone: false
})
export class TeamListCardComponent implements OnInit {
  @Input() allowSelection = true;
  @Input() hideRanks = false;
  @Input() team?: TeamListCardContext;
  @Input() selected = false;

  @Output() selectedChange = new EventEmitter<string>();
  @Output() teamClicked = new EventEmitter<string>();
  @Output() teamSelected = new EventEmitter<{ teamId: string, isSelected: boolean }>();

  ngOnInit(): void {
    if (!this.team)
      throw new Error("team is required");
  }

  protected handleTeamClicked(teamId: string) {
    this.teamClicked.emit(teamId);
  }

  protected handleTeamSelected(event: Event, teamId: string) {
    if (!this.allowSelection)
      return;

    this.teamSelected.emit({ teamId, isSelected: (event.target as HTMLInputElement).checked });
  }
}
