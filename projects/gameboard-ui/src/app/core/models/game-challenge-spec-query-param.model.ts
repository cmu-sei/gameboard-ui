import { inject } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { RouterService } from "@/services/router.service";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { cloneNonNullAndDefinedProperties } from "@/../tools/object-tools.lib";

interface GameChallengeSpec {
    gameId: string | null;
    challengeSpecId: string | null;
}

export class GameChallengeSpecQueryModel {
    private challengeSpecIdParamName: string;
    private gameIdParamName: string;

    private route: ActivatedRoute = inject(ActivatedRoute);
    private routerService: RouterService = inject(RouterService);
    private unsub: UnsubscriberService = inject(UnsubscriberService);

    constructor(config?: { gameIdParamName?: string, challengeSpecIdParamName?: string }) {
        this.challengeSpecIdParamName = config?.challengeSpecIdParamName || "challengeSpecId";
        this.gameIdParamName = config?.gameIdParamName || "gameId";

        this.unsub.add(
            this.route.queryParamMap.subscribe(paramMap => {
                this._model = {
                    challengeSpecId: paramMap.get(this.challengeSpecIdParamName) || null,
                    gameId: paramMap.get(this.gameIdParamName) || null,
                };
            })
        );
    }

    private _model: GameChallengeSpec = { gameId: null, challengeSpecId: null };

    get gameId(): string | null {
        return this._model.gameId;
    }
    set gameId(value: string | null) {
        if (value !== this._model.gameId) {
            this._model.gameId = value;
            this.updateQueryParams(this._model);
        }
    }

    get challengeSpecId(): string | null {
        return this._model.challengeSpecId;
    }
    set challengeSpecId(value: string | null) {
        if (value !== this._model.challengeSpecId) {
            this._model.challengeSpecId = value;
            this.updateQueryParams(this._model);
        }
    }

    private updateQueryParams(model: GameChallengeSpec) {
        const params: Params = cloneNonNullAndDefinedProperties(model);

        this.routerService.updateQueryParams({
            parameters: params,
            resetParams: [this.challengeSpecIdParamName, this.gameIdParamName]
        });
    }
}
