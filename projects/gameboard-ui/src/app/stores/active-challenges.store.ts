import { LocalActiveChallenge } from "@/api/challenges.models";
import { createStore, withProps } from "@ngneat/elf";
import { SimpleEntity } from "@/api/models";
import { Observable, Subject, Subscription, combineLatest, firstValueFrom, interval, map, merge, of, startWith, switchMap, tap } from "rxjs";
import { Injectable, OnDestroy } from "@angular/core";
import { UserService as LocalUserService } from "@/utility/user.service";
import { ChallengesService } from "@/api/challenges.service";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { PlayerService } from "@/api/player.service";
import { DateTime } from "luxon";
import { Challenge } from "@/api/board-models";
import { TeamService } from "@/api/team.service";

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
    private _subs: Subscription[] = [];
    public readonly activePracticeChallenge$: Observable<LocalActiveChallenge | null> = activeChallengesStore
        .pipe(
            startWith(activeChallengesStore.state),
            switchMap(store => of(this.resolveActivePracticeChallenge(store)))
        );

    private readonly _practiceChallengeAttemptsExhausted$ = new Subject<LocalActiveChallenge>();
    public readonly practiceChallengeAttemptsExhausted$ = this._practiceChallengeAttemptsExhausted$.asObservable();

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
                merge(
                    challengesService.challengeGraded$,
                    challengesService.challengeDeployStateChanged$,
                    playerService.playerSessionReset$,
                    teamService.playerSessionChanged$,
                    teamService.teamSessionChanged$
                )
            ]).pipe(
                map(([challengesService]) => ({ challengesService })),
            ).subscribe(ctx => this._initState(ctx.challengesService, localUser.user$.value?.id || null)),
            interval(1000).subscribe(() => this.checkActiveChallengesForEnd()),
            challengesService.challengeGraded$.subscribe(challenge => this.handleChallengeGraded(challenge))
        );

        this._initState(challengesService, localUser.user$.value?.id || null);
    }

    ngOnDestroy(): void {
        for (let sub of this._subs) {
            sub.unsubscribe();
        }
    }

    getActivePracticeChallenge(): LocalActiveChallenge | null {
        return this.resolveActivePracticeChallenge(activeChallengesStore.value);
    }

    private checkActiveChallengesForEnd() {
        const challenges = [...activeChallengesStore.state.practice];

        // for now, we'll only emit practice challenge ends
        for (const challenge of challenges) {
            if (DateTime.now() > challenge.session.end!) {
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

            } else if (challenge.state.challenge.attempts >= challenge.state.challenge.maxAttempts) {
                // did they exhaust their guesses?
                this._practiceChallengeAttemptsExhausted$.next(activePracticeChallenge);
                removeChallengeFromState = true;
            }

            if (removeChallengeFromState) {
                activeChallengesStore.update(state => {
                    const completedChallengeIndex = state.practice.findIndex(c => c.spec.id === activePracticeChallenge.spec.id);

                    return {
                        ...state,
                        practice: state.practice.slice(completedChallengeIndex, 1)
                    };
                });
            }
        }
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

    private resolveActivePracticeChallenge(storeState: ActiveChallengesProps) {
        return storeState.practice.length ? storeState.practice[0] : null;
    }
}
