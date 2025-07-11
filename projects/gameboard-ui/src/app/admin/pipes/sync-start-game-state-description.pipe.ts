import { Pipe, PipeTransform } from '@angular/core';
import { ExternalGameAdminContext, SyncStartPlayerStatus } from '../components/external-game-admin/external-game-admin.component';
import { NowService } from '@/services/now.service';

@Pipe({
    name: 'syncStartGameStateDescription',
    standalone: false
})
export class SyncStartGameStateDescriptionPipe implements PipeTransform {
  constructor(now: NowService) { }

  transform(ctx: ExternalGameAdminContext): string {
    if (!ctx || !ctx?.teams?.length)
      return "";

    const allPlayers = ctx
      .teams
      .reduce((accumulator, team) => accumulator.concat(...team.players), [] as { status: SyncStartPlayerStatus }[]);

    if (allPlayers.length == 0)
      return "";

    if (ctx.startTime && ctx.endTime && ctx.endTime)
      return `This game is live! **${ctx.teams.length}** team(s) are playing.`;

    return `Waiting for the game to start. **${ctx.teams.filter(t => t.isReady).length}/${ctx.teams.length}** team(s) (**${allPlayers.filter(p => p.status == "ready").length}/${allPlayers.length}** players) are ready.`;
  }
}
