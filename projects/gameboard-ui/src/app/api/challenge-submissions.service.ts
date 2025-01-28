import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { ChallengeSubmissionAnswers, ChallengeSubmissionHistory, GetChallengeSubmissionsResponseLegacy } from "./challenges.models";
import { firstValueFrom, Observable } from "rxjs";
import { ApiUrlService } from "@/services/api-url.service";
import { groupBy } from "../../tools/tools";

@Injectable({ providedIn: 'root' })
export class ChallengeSubmissionsService {
    private apiUrl = inject(ApiUrlService);
    private http = inject(HttpClient);

    public async getSubmissions(challengeId: string): Promise<ChallengeSubmissionHistory> {
        const legacySubmissions = await firstValueFrom(this.getSubmissionsLegacy(challengeId));
        const submissionsBySection = groupBy(legacySubmissions.submittedAnswers, s => s.sectionIndex);

        const retVal: ChallengeSubmissionHistory = {
            challengeId: legacySubmissions.challengeId,
            teamId: legacySubmissions.teamId,
            sectionSubmissions: Array.from(submissionsBySection.keys()).reduce((dict, index) => {
                dict[index] = [];
                return dict;
            }, {})
        };

        for (const section of submissionsBySection) {
            for (const submission of section[1]) {
                retVal.sectionSubmissions[section[0]].push({
                    answers: submission.answers,
                    submittedAt: DateTime.fromISO(submission.submittedOn?.toString()).toMillis()
                });
            }
        }

        return retVal;
    }

    public getSubmissionsLegacy(challengeId: string): Observable<GetChallengeSubmissionsResponseLegacy> {
        return this.http.get<GetChallengeSubmissionsResponseLegacy>(this.apiUrl.build(`challenge/${challengeId}/submissions`));
    }

    public savePendingSubmission(challengeId: string, submission: ChallengeSubmissionAnswers) {
        return this.http.put(this.apiUrl.build(`challenge/${challengeId}/submissions/pending`), submission);
    }
}
