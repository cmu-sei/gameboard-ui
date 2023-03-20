import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faCaretDown, faCaretRight, faCaretLeft, faSync, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { BoardService } from '../../api/board.service';
import { FeedbackQuestion, FeedbackReportDetails, FeedbackStats } from '../../api/feedback-models';
import { FeedbackService } from '../../api/feedback.service';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ReportService } from '../../api/report.service';
import { Spec } from '../../api/spec-models';

@Component({
  selector: 'app-feedback-report',
  templateUrl: './feedback-report.component.html',
  styleUrls: ['./feedback-report.component.scss']
})
export class FeedbackReportComponent implements OnInit {
  errors: any[] = [];

  showSummary: boolean = true;
  showQuestions: boolean = false;
  showTable: boolean = false;

  games?: Game[];
  challengeSpecs?: Spec[];
  feedback?: FeedbackReportDetails[];
  feedbackStats?: FeedbackStats;
  currentGame?: Game;
  currentChallengeSpec?: Spec;
  currentType?: string = 'game';
  submittedOnly: boolean = true;

  configQuestions: FeedbackQuestion[] = [];

  tablePageSize: number = 25;
  take = 0;
  skip = 0;

  faArrowLeft = faArrowLeft;
  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;
  faCaretLeft = faCaretLeft;
  faSync = faSync;
  faFileDownload = faFileDownload;

  constructor(
    private gameService: GameService,
    private boardService: BoardService,
    private api: FeedbackService,
    private reportService: ReportService,
  ) {
    this.gameService.list({}).subscribe(
      (games: Game[]) => {
        this.games = games;
        if (this.games.length > 0) {
          this.currentGame = this.games[0];
          this.gameSelected();
        }
      },
      (error: any) => { }
    );
  }

  ngOnInit(): void {
  }

  updateGame(id: string) {
    if (this.games) {
      this.currentGame = this.games?.find(g => g.id === id);
      this.gameSelected();
    }
  }

  gameSelected() {
    this.currentChallengeSpec = undefined;
    this.challengeSpecs = [];
    this.updateTableCols();
    this.gameService.retrieveSpecs(this.currentGame?.id!).subscribe(
      r => {
        this.challengeSpecs = r;
      }
    );
    this.fetchAll();
  }

  updateChallenge(id: string) {
    if (id == "all") {
      this.currentChallengeSpec = undefined;
    } else if (this.challengeSpecs) {
      this.currentChallengeSpec = this.challengeSpecs?.find(g => g.id === id);
    }
    this.fetchAll();
  }

  updateType(type: string) {
    this.currentType = type;
    this.currentChallengeSpec = undefined;
    this.updateTableCols();
    this.fetchAll();
  }

  updateTableCols() {
    if (this.currentType == "game") {
      this.configQuestions = this.currentGame?.feedbackTemplate?.game ?? [];
    } else if (this.currentType == "challenge") {
      this.configQuestions = this.currentGame?.feedbackTemplate?.challenge ?? [];
    }
  }

  fetchAll() {
    if (this.currentGame?.feedbackTemplate && this.configQuestions.length) {
      this.fetchFeedback();
      this.fetchStats();
    } else {
      this.feedback = undefined;
      this.feedbackStats = undefined;
    }
  }

  fetchFeedback() {
    this.feedback = undefined;
    const params = this.makeSearchParams();
    this.api.list(params).subscribe(
      (feedback: FeedbackReportDetails[]) => {
        this.feedback = feedback;
      },
      (error: any) => { }
    );
  }

  fetchStats() {
    this.feedbackStats = undefined;
    const params = this.makeSearchParams();
    this.reportService.feedbackStats(params).subscribe(
      (feedbackStats: FeedbackStats) => {
        this.feedbackStats = feedbackStats;
      },
      (error: any) => { }
    );
  }

  export(key: string) {
    if (key == "details")
      this.reportService.exportFeedbackDetails(this.makeSearchParams(), this.createExportName(false));
    else if (key == "stats")
      this.reportService.exportFeedbackStats(this.makeSearchParams(), this.createExportName(true));
  }

  makeSearchParams() {
    let params: any = {};
    if (this.currentType)
      params.type = this.currentType;
    if (this.currentChallengeSpec)
      params.challengeSpecId = this.currentChallengeSpec.id;
    if (this.currentGame?.id)
      params.gameId = this.currentGame?.id;
    if (this.submittedOnly) // currently, only show summitted
      params.submitStatus = 'submitted';
    params.sort = 'newest';
    params.skip = this.skip;
    params.take = this.tablePageSize;
    return params;
  }

  createExportName(isStats: boolean) {
    const label = this.currentChallengeSpec?.tag ?? this.currentGame?.name;
    const type = this.currentType;
    const stats = isStats ? "-stats" : "";
    return `${label}-${type}-feedback${stats}-`;
  }

  toggle(item: string) {
    if (item == 'summary')
      this.showSummary = !this.showSummary;
    if (item == 'questions')
      this.showQuestions = !this.showQuestions;
    if (item == 'table')
      this.showTable = !this.showTable;
  }

  refresh() {
    this.skip = 0;
    this.fetchAll();
  }

  next() {
    this.skip = this.skip + this.tablePageSize;
    this.fetchFeedback()
  }

  prev() {
    this.skip = this.skip - this.tablePageSize;
    if (this.skip < 0)
      this.skip = 0;
    this.fetchFeedback()
  }

  toggleRow(i: number) {
    if (window.getSelection()?.toString()?.length != 0)
      return;
    let id = "row-" + i;
    document.getElementById(id)?.classList.toggle('minimized');
  }

}
