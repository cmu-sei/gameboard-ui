import { LocalActiveChallenge } from "@/api/board-models";
import { createStore, withProps } from "@ngneat/elf";

interface ActiveChallengesProps {
    practice: LocalActiveChallenge[];
    competition: LocalActiveChallenge[];
}

export const activeChallengesStore = createStore(
    { name: 'activeChallenges' },
    withProps<ActiveChallengesProps>({
        competition: [],
        practice: []
    })
);
