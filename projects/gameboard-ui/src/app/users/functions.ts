import { PlayerCertificate, PlayerMode } from "@/api/player-models";
import { PracticeModeCertificate, PublishedCertificateViewModel } from "./users.models";

export function practiceCertificateToPublishedViewModel(certificate: PracticeModeCertificate): PublishedCertificateViewModel {
    return {
        ...certificate,
        awardedForEntity: { id: certificate.challenge.challengeSpecId, name: certificate.challenge.name },
        mode: PlayerMode.practice
    };
}

export function competitiveCertificateToPublishedViewmodel(certificate: PlayerCertificate): PublishedCertificateViewModel {
    return {
        id: undefined,
        publishedOn: certificate.publishedOn,
        awardedForEntity: { id: certificate.game.id, name: certificate.game.name },
        ownerUser: { id: certificate.player.userId, name: certificate.player.approvedName },
        mode: PlayerMode.competition
    };
}
