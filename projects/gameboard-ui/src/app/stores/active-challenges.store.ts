import { LocalActiveChallenge } from "@/api/challenges.models";
import { createStore, withProps } from "@ngneat/elf";
import { SimpleEntity } from "@/api/models";
import { Observable, combineLatest, filter, firstValueFrom, map, merge, of, startWith, switchMap, tap } from "rxjs";
import { Injectable, OnDestroy } from "@angular/core";
import { UserService as LocalUserService } from "@/utility/user.service";
import { ChallengesService } from "@/api/challenges.service";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { PlayerService } from "@/api/player.service";

interface ActiveChallengesProps {
    user: SimpleEntity;
    practice: LocalActiveChallenge[];
    competition: LocalActiveChallenge[];
}

const DEFAULT_STATE: ActiveChallengesProps = {
    user: { id: "", name: "" },
    competition: [],
    practice: []
};

export const activeChallengesStore = createStore(
    { name: 'activeChallenges' },
    withProps<ActiveChallengesProps>(DEFAULT_STATE),
);

export type ActiveChallengesPredicate = (challenge: LocalActiveChallenge) => challenge is LocalActiveChallenge;

@Injectable({ providedIn: 'root' })
export class ActiveChallengesRepo implements OnDestroy {
    public readonly activePracticeChallenge$: Observable<LocalActiveChallenge | null> = activeChallengesStore
        .pipe(
            startWith(activeChallengesStore.state),
            switchMap(store => of(this.resolveActivePracticeChallenge(store))),
        );

    constructor(
        challengesService: ChallengesService,
        playerService: PlayerService,
        localUser: LocalUserService,
        private unsub: UnsubscriberService) {

        this.unsub.add(
            combineLatest([
                of(challengesService),
                localUser.user$,
                merge(
                    challengesService.challengeGraded$,
                    challengesService.challengeDeployStateChanged$,
                    playerService.playerSessionReset$,
                    playerService.playerSessionChanged$,
                    playerService.teamSessionChanged$
                )
            ]).pipe(
                map(([challengesService]) => ({ challengesService })),
            ).subscribe(ctx => this._initState(ctx.challengesService, localUser.user$.value?.id || null))
        );

        this._initState(challengesService, localUser.user$.value?.id || null);
    }

    ngOnDestroy(): void {
        this.unsub.unsubscribeAll();
    }

    private async _initState(challengesService: ChallengesService, localUserId: string | null) {
        if (!localUserId) {
            activeChallengesStore.update(state => DEFAULT_STATE);
            return;
        }

        // the challenges come in with an API-level time-window (with epoch times for session)
        // we have to map them to localized time windows
        const userActiveChallenges = await firstValueFrom(challengesService.getActiveChallenges(localUserId!));

        // update the store
        activeChallengesStore.update(state => ({
            ...userActiveChallenges
        }));
    }

    getActivePracticeChallenge(): LocalActiveChallenge | null {
        return this.resolveActivePracticeChallenge(activeChallengesStore.value);
    }

    isTeamChallenge = (challenge: LocalActiveChallenge, teamId: string): challenge is LocalActiveChallenge => {
        return challenge.teamId === teamId;
    };

    search(predicate: ActiveChallengesPredicate): LocalActiveChallenge[] {
        return [
            ...(activeChallengesStore.state.practice.filter(predicate) || []),
            ...(activeChallengesStore.state.competition.filter(predicate) || [])
        ];
    }

    private resolveActivePracticeChallenge(storeState: ActiveChallengesProps) {
        return storeState.practice.length ? storeState.practice[0] : null;
    }
}
