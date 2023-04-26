import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ReportsService } from "./reports.service";
import { firstValueFrom } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ReportTitleResolver {
    private readonly reportKey: string;

    constructor(
        route: ActivatedRoute,
        private reportsService: ReportsService) {
        this.reportKey = route.snapshot.params['reportKey']
    }

    async resolve(): Promise<string> {
        const report = await this.reportsService.get(this.reportKey);

        if (report)
            return report.name;

        return "Report";
    }
}
