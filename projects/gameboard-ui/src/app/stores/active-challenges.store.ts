import { LocalActiveChallenge } from "@/api/challenges.models";
import { createStore, withProps } from "@ngneat/elf";
import { SimpleEntity } from "@/api/models";
import { Observable, combineLatest, firstValueFrom, map, of } from "rxjs";
import { Injectable, OnDestroy } from "@angular/core";
import { UserService as LocalUserService } from "@/utility/user.service";
import { ChallengesService } from "@/api/challenges.service";
import { UnsubscriberService } from "@/services/unsubscriber.service";

interface ActiveChallengesProps {
    user: SimpleEntity;
    practice: LocalActiveChallenge[];
    competition: LocalActiveChallenge[];
}

const DEFAULT_STATE: ActiveChallengesProps = {
    user: { id: "", name: "" },
    competition: [],
    practice: []
}

export const activeChallengesStore = createStore(
    { name: 'activeChallenges' },
    withProps<ActiveChallengesProps>(DEFAULT_STATE),
);

export type ActiveChallengesPredicate = (challenge: LocalActiveChallenge) => challenge is LocalActiveChallenge;

@Injectable()
export class ActiveChallengesRepo implements OnDestroy {
    constructor(
        challengesService: ChallengesService,
        private localUser: LocalUserService,
        private unsub: UnsubscriberService) {
        this.unsub.add(
            combineLatest([
                of(challengesService),
                localUser.user$
            ]).pipe(
                map(([challengesService, user]) => ({ challengesService, user }))
            ).subscribe(ctx => this._initState(ctx.challengesService, ctx.user?.id || null))
        );
    }

    ngOnDestroy(): void {
        throw new Error("Method not implemented.");
    }

    private async _initState(challengesService: ChallengesService, localUserId: string | null) {
        if (!localUserId) {
            activeChallengesStore.update(state => DEFAULT_STATE);
        }

        // the challenges come in with an API-level time-window (with epoch times for session)
        // we have to map them to localized time windows
        const userActiveChallenges = await firstValueFrom(challengesService.getActiveChallenges(localUserId!));

        // update the store
        activeChallengesStore.update(state => ({
            ...userActiveChallenges
        }));
    }

    activePracticeChallenge$(): Observable<LocalActiveChallenge | null> {
        return activeChallengesStore.pipe(map(store => store.practice.length ? store.practice[0] : null));
    }

    getPracticeChallenge(): LocalActiveChallenge | null {
        return activeChallengesStore.state.practice.length ? activeChallengesStore.state.practice[0] : null;
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
}
