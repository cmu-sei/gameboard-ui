export interface SiteUsageReport {
    avgCompetitiveChallengesPerCompetitiveUser: number;
    avgPracticeChallengesPerPracticeUser: number;
    competitiveUsersWithNoPracticeCount: number;
    deployedChallengesCount: number;
    deployedChallengesCompetitiveCount: number;
    deployedChallengesPracticeCount: number;
    deployedChallengesSpecCount: number;
    practiceUsersWithNoCompetitiveCount: number;
    sponsorCount: number;
    userCount: number;
}

export interface SiteUsageReportFlatParameters {
    sponsors?: string;
    startDate?: string;
    endDate?: string;
}
