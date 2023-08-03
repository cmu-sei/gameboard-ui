import { LocalActiveChallenge } from "@/api/challenges.models";
import { createStore, withProps } from "@ngneat/elf";
import { SimpleEntity } from "@/api/models";

interface ActiveChallengesProps {
    user: SimpleEntity;
    practice: LocalActiveChallenge[];
    competition: LocalActiveChallenge[];
}

export const activeChallengesStore = createStore(
    { name: 'activeChallenges' },
    withProps<ActiveChallengesProps>({
        user: { id: "", name: "" },
        competition: [],
        practice: []
    })
);
