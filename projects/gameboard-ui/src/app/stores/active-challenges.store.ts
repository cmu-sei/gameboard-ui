import { Injectable, OnDestroy } from "@angular/core";
import { createStore, withProps } from "@ngneat/elf";
import { DateTime } from "luxon";
import { Observable, Subject, Subscription, interval, of, startWith, switchMap } from "rxjs";
import { UserActiveChallenge } from "@/api/challenges.models";
import { SimpleEntity } from "@/api/models";
import { ChallengesService } from "@/api/challenges.service";
import { Challenge } from "@/api/board-models";
import { TeamService } from "@/api/team.service";
import { NowService } from "@/services/now.service";
import { PlayerMode } from "@/api/player-models";
import { TeamSessionUpdate } from "@/api/teams.models";
import { UserService as LocalUserService } from "@/utility/user.service";

interface ActiveChallengesProps {
    user: SimpleEntity;
    challenges: UserActiveChallenge[];
}

const DEFAULT_STATE: ActiveChallengesProps = {
    user: { id: "", name: "" },
    challenges: [],
};

export const activeChallengesStore = createStore(
    { name: 'activeChallenges' },
    withProps<ActiveChallengesProps>(DEFAULT_STATE),
);

@Injectable({ providedIn: 'root' })
export class ActiveChallengesRepo implements OnDestroy {
    private _subs: Subscription[] = [];
    public readonly activePracticeChallenge$: Observable<UserActiveChallenge | null> = activeChallengesStore
        .pipe(
            startWith(activeChallengesStore.state),
            switchMap(store => of(this.resolveActivePracticeChallenge(store)))
        );

    private readonly _challengeCompleted$ = new Subject<UserActiveChallenge>();
    public readonly challengeCompleted$ = this._challengeCompleted$.asObservable();

    private readonly _challengeExpired$ = new Subject<UserActiveChallenge>();
    public readonly challengeExpired$ = this._challengeExpired$.asObservable();

    private readonly _challengeReset$ = new Subject<UserActiveChallenge>();
    public readonly challengeReset$ = this._challengeReset$.asObservable();

    constructor(
        challengesService: ChallengesService,
        localUser: LocalUserService,
        teamService: TeamService,
        private nowService: NowService) {
        this._subs.push(localUser.user$.subscribe(async u => {
            await this._initState(challengesService, u?.id || null);
        }));

        this._subs.push(
            interval(1000).subscribe(() => this.checkActiveChallengesForEnd()),
            challengesService.challengeStarted$.subscribe(challenge => this.handleChallengeStarted(challenge)),
            challengesService.challengeGraded$.subscribe(challenge => this.handleChallengeGraded(challenge)),
            challengesService.challengeDeployStateChanged$.subscribe(challenge => this.handleChallengeDeployStateChanged(challenge)),
            teamService.teamSessionEndedManually$.subscribe(tId => this.handleTeamSessionEndedManually(tId)),
            teamService.teamSessionsChanged$.subscribe(updates => this.handleTeamSessionsChanged(updates))
        );

        this._initState(challengesService, localUser.user$.value?.id || null);
    }

    ngOnDestroy(): void {
        for (let sub of this._subs) {
            sub?.unsubscribe();
        }
    }

    getActivePracticeChallenge(): UserActiveChallenge | null {
        return this.resolveActivePracticeChallenge(activeChallengesStore.value);
    }

    private checkActiveChallengesForEnd() {
        const challenges = [...activeChallengesStore.state.challenges];

        const nowish = this.nowService.nowToMsEpoch();
        for (const challenge of challenges) {
            if (challenge.endsAt && challenge.endsAt < nowish) {
                this._challengeExpired$.next(challenge);
                this.removeFromActive(challenge.id);
            }
        }
    }

    private handleChallengeDeployStateChanged(challengeDeployStateChange: Challenge) {
        this.updateChallenge(challengeDeployStateChange.id, c => {
            c.isDeployed = challengeDeployStateChange.hasDeployedGamespace;
            c.markdown = challengeDeployStateChange.state.markdown;
            c.scoreAndAttemptsState = {
                attempts: challengeDeployStateChange.state.challenge.attempts,
                maxAttempts: challengeDeployStateChange.state.challenge.maxAttempts,
                maxPossibleScore: challengeDeployStateChange.state.challenge.maxPoints,
                score: challengeDeployStateChange.score,
            };
            c.vms = challengeDeployStateChange.state.vms;

            return c;
        });
    }

    private handleChallengeGraded(gradedChallenge: Challenge) {
        // check if the graded challenge is the active practice challenge, and if it is, evaluate it for completeness
        // and grading attempts, and notify appropriate subjects
        // no matter what, update the activeChallenge thing in state with the deploy state of the
        // challenge's gamespace
        const updatedChallenge = this.updateChallenge(gradedChallenge.id, c => {
            c.isDeployed = gradedChallenge.hasDeployedGamespace;
            c.markdown = gradedChallenge.state.markdown;
            c.scoreAndAttemptsState = {
                attempts: gradedChallenge.state.challenge.attempts,
                maxAttempts: gradedChallenge.state.challenge.maxAttempts,
                maxPossibleScore: gradedChallenge.state.challenge.maxPoints,
                score: gradedChallenge.score,
            };
            c.vms = gradedChallenge.state.vms;

            return c;
        });

        if (gradedChallenge.score >= gradedChallenge.points) {
            this._challengeCompleted$.next(updatedChallenge);
            this.removeFromActive(gradedChallenge.id);
        }
    }

    private handleChallengeStarted(challenge: Challenge) {
        this.removeFromActive(challenge.id);

        activeChallengesStore.update(state => {
            return {
                ...state,
                challenges: [...state.challenges, this.toActiveChallenge(challenge)]
            };
        });
    }

    private async handleTeamSessionsChanged(teamSessionUpdates: TeamSessionUpdate[]) {
        activeChallengesStore.update(state => {
            const updatedChallenges: UserActiveChallenge[] = [];

            for (let update of teamSessionUpdates) {
                for (let challenge of state.challenges) {
                    if (challenge.team.id === update.id) {
                        challenge.endsAt = update.sessionEndsAt;
                    }
                    updatedChallenges.push(challenge);
                }
            }

            return {
                ...state,
                challenges: updatedChallenges
            };
        });
    }

    private handleTeamSessionEndedManually(teamId: string) {
        const teamChallenges = activeChallengesStore.state.challenges.filter(c => c.team.id === teamId);
        this.removeFromActiveWithPredicate(c => c.team.id == teamId);
        for (let challenge of teamChallenges) {
            this._challengeReset$.next(challenge);
        }
    }

    private removeFromActive(challengeId: string) {
        this.removeFromActiveWithPredicate(c => c.id === challengeId);
    }

    private removeFromActiveWithPredicate(predicate: (c: UserActiveChallenge) => boolean) {
        activeChallengesStore.update(state => {
            return {
                ...state,
                challenges: [...state.challenges.filter(c => !predicate(c))]
            };
        });
    }

    private updateChallenge(challengeId: string, update: (c: UserActiveChallenge) => UserActiveChallenge): UserActiveChallenge {
        activeChallengesStore.update(state => {
            const challenge = state.challenges.find(c => c.id === challengeId);

            if (!challenge)
                return state;

            return {
                ...state,
                challenges: [...state.challenges.filter(c => c.id === challengeId), update(challenge)]
            };
        });

        return activeChallengesStore.state.challenges.find(c => c.id === challengeId)!;
    }

    private async _initState(challengesService: ChallengesService, localUserId: string | null) {
        if (!localUserId) {
            activeChallengesStore.update(() => DEFAULT_STATE);
            return;
        }

        const response = await challengesService.getActiveChallenges(localUserId);

        // update the store
        activeChallengesStore.update(state => ({
            challenges: response.challenges,
            user: response.user
        }));
    }

    private resolveActivePracticeChallenge(storeState: ActiveChallengesProps) {
        return storeState.challenges.find(c => c.mode === PlayerMode.practice) || null;
    }

    private toActiveChallenge(challenge: Challenge): UserActiveChallenge {
        return {
            id: challenge.id,
            name: challenge.name,
            endsAt: DateTime.fromJSDate(new Date(challenge.endTime)).toMillis(),
            mode: PlayerMode.practice,
            game: { id: "", name: "" },
            spec: { id: challenge.specId, name: challenge.name },
            team: { id: challenge.teamId, name: "" },
            isDeployed: challenge.hasDeployedGamespace,
            markdown: challenge.state.markdown,
            vms: challenge.state.vms,
            scoreAndAttemptsState: {
                attempts: challenge.state.challenge.attempts,
                maxAttempts: challenge.state.challenge.maxAttempts,
                score: challenge.state.challenge.score,
                maxPossibleScore: challenge.state.challenge.maxPoints
            }
        };
    }
}
