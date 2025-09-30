// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { PlayerMode } from "@/api/player-models";
import { CompetitiveModeCertificate, PracticeModeCertificate, PublishedCertificateViewModel } from "@/certificates/certificates.models";

export function practiceCertificateToPublishedViewModel(certificate: PracticeModeCertificate): PublishedCertificateViewModel {
    return {
        ...certificate,
        awardedForEntity: { id: certificate.challenge.challengeSpecId, name: certificate.challenge.name },
        mode: PlayerMode.practice
    };
}

export function competitiveCertificateToPublishedViewmodel(certificate: CompetitiveModeCertificate): PublishedCertificateViewModel {
    return {
        ...certificate,
        awardedForEntity: { id: certificate.game.id, name: certificate.game.name },
        mode: PlayerMode.competition
    };
}
