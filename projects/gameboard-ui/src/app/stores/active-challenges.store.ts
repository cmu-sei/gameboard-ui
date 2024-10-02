import { Injectable, OnDestroy } from "@angular/core";
import { createStore, withProps } from "@ngneat/elf";
import { DateTime } from "luxon";
import { Observable, Subject, Subscription, combineLatest, firstValueFrom, interval, map, merge, of, startWith, switchMap } from "rxjs";
import { LocalActiveChallenge } from "@/api/challenges.models";
import { SimpleEntity } from "@/api/models";
import { ChallengesService } from "@/api/challenges.service";
import { PlayerService } from "@/api/player.service";
import { Challenge } from "@/api/board-models";
import { TeamService } from "@/api/team.service";
import { UserService as LocalUserService } from "@/utility/user.service";

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

@Injectable({ providedIn: 'root' })
export class ActiveChallengesRepo implements OnDestroy {
    private _subs: Subscription[] = [];
    public readonly activePracticeChallenge$: Observable<LocalActiveChallenge | null> = activeChallengesStore
        .pipe(
            startWith(activeChallengesStore.state),
            switchMap(store => of(this.resolveActivePracticeChallenge(store)))
        );

    private readonly _practiceChallengeCompleted$ = new Subject<LocalActiveChallenge>();
    public readonly practiceChallengeCompleted$ = this._practiceChallengeCompleted$.asObservable();

    private readonly _practiceChallengeExpired$ = new Subject<string>();
    public readonly practiceChallengeExpired$ = this._practiceChallengeExpired$.asObservable();

    constructor(
        challengesService: ChallengesService,
        playerService: PlayerService,
        localUser: LocalUserService,
        teamService: TeamService) {

        this._subs.push(
            combineLatest([
                of(challengesService),
                localUser.user$,
                merge([
                    challengesService.challengeGraded$,
                    challengesService.challengeDeployStateChanged$,
                    playerService.playerSessionReset$,
                    teamService.playerSessionChanged$,
                    teamService.teamSessionsChanged$
                ])
            ]).pipe(
                map(([challengesService]) => ({ challengesService })),
            ).subscribe(ctx => this._initState(ctx.challengesService, localUser.user$.value?.id || null)),
            interval(1000).subscribe(() => this.checkActiveChallengesForEnd()),
            challengesService.challengeGraded$.subscribe(challenge => this.handleChallengeGraded(challenge)),
            teamService.teamSessionEndedManually$.subscribe(tId => this.handleTeamSessionEndedManually(tId))

        );

        this._initState(challengesService, localUser.user$.value?.id || null);
    }

    ngOnDestroy(): void {
        for (let sub of this._subs) {
            sub?.unsubscribe();
        }
    }

    getActivePracticeChallenge(): LocalActiveChallenge | null {
        return this.resolveActivePracticeChallenge(activeChallengesStore.value);
    }

    private checkActiveChallengesForEnd() {
        const challenges = [...activeChallengesStore.state.practice];

        // for now, we'll only emit practice challenge ends
        for (const challenge of challenges) {
            if (challenge.session.end && DateTime.now() > challenge.session.end!) {
                this._practiceChallengeExpired$.next(challenge.challengeDeployment.challengeId);
                activeChallengesStore.update(state => ({
                    ...state,
                    practice: []
                }));
            }
        }
    }

    private handleChallengeGraded(challenge: Challenge) {
        // check if the graded challenge is the active practice challenge, and if it is, evaluate it for completeness
        // and grading attempts, and notify appropriate subjects
        const activePracticeChallenge = this.resolveActivePracticeChallenge(activeChallengesStore.state);
        if (activePracticeChallenge?.challengeDeployment.challengeId === challenge.id) {
            // no matter what, update the activeChallenge thing in state with the deploy state of the 
            // challenge's gamespace
            activePracticeChallenge.challengeDeployment.isDeployed = challenge.state.isActive;
            let removeChallengeFromState = false;

            if (challenge.score >= challenge.points) {
                // did they complete?
                this._practiceChallengeCompleted$.next(activePracticeChallenge);
                removeChallengeFromState = true;
            }

            if (removeChallengeFromState) {
                this.removeFromActive(activePracticeChallenge);
                activeChallengesStore.update(state => {
                    return {
                        ...state,
                        practice: [...state.practice.filter(c => c.spec.id !== activePracticeChallenge.spec.id)]
                    };
                });
            }
        }
    }

    private handleTeamSessionEndedManually(teamId: string) {
        this.removeFromActiveWithPredicate(c => c.teamId == teamId);
    }

    private getAllChallenges() {
        return [
            ...activeChallengesStore.state.competition,
            ...activeChallengesStore.state.practice
        ];
    }

    private removeFromActive(endedChallenge: Challenge | LocalActiveChallenge) {
        this.removeFromActiveWithPredicate(c => c.id === endedChallenge.id);
    }

    private removeFromActiveWithPredicate(predicate: (c: LocalActiveChallenge) => boolean) {
        activeChallengesStore.update(state => {
            return {
                ...state,
                competition: [...state.competition.filter(c => !predicate(c))],
                practice: [...state.practice.filter(c => !predicate(c))]
            };
        });
    }

    private async _initState(challengesService: ChallengesService, localUserId: string | null) {
        if (!localUserId) {
            activeChallengesStore.update(state => DEFAULT_STATE);
            return;
        }

        // the challenges come in with an API-level time-window (with epoch times for session)
        // we have to map them to localized time windows
        const userActiveChallenges = await firstValueFrom(challengesService.getActiveChallenges(localUserId));

        // update the store
        activeChallengesStore.update(state => ({
            ...userActiveChallenges
        }));
    }

    private resolveActivePracticeChallenge(storeState: ActiveChallengesProps) {
        return storeState.practice.length ? storeState.practice[0] : null;
    }
}
