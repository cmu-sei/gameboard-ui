import { Component, OnInit } from '@angular/core';
import { faTrash, faList, faSearch, faFilter, faCheck, faTintSlash, faArrowLeft, faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Challenge, ChallengeSummary } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { Feedback, FeedbackQuestion, FeedbackReportDetails, FeedbackSearchParams, QuestionType } from '../../api/feedback-models';
import { FeedbackService } from '../../api/feedback.service';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { Search } from '../../api/models';
import { ReportService } from '../../api/report.service';

@Component({
  selector: 'app-feedback-report',
  templateUrl: './feedback-report.component.html',
  styleUrls: ['./feedback-report.component.scss']
})
export class FeedbackReportComponent implements OnInit {
  showSummary: boolean = true;
  showQuestions: boolean = false;
  showTable: boolean = false;
  
  games?: Game[];
  challenges?: any[];
  feedback?: FeedbackReportDetails[];
  currentGame?: Game;
  currentChallenge?: any;
  currentType?: string = 'game';
  
  radioCols?: FeedbackQuestion[] = [];
  allCols?: FeedbackQuestion[] = [];

  search: FeedbackSearchParams = {};
  faArrowLeft = faArrowLeft;
  faList = faList;
  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;
  constructor(
    private gameService: GameService,
    private boardService: BoardService,
    private api: FeedbackService,
    private reportService: ReportService,
  ) {
    this.gameService.list({}).subscribe(
      r => {
        this.games = r;
        if (this.games.length > 0) {
          this.currentGame = this.games[0];
          this.afterGameSelected();
        }
      }
    );
  }

  ngOnInit(): void {
  }

  updateGame(id: string) {
    if (this.games) {
      this.currentGame = this.games.find(g => g.id === id);
      this.afterGameSelected();
    }
  }

  afterGameSelected() {
    console.log(this.currentGame);
    this.currentChallenge = undefined;
    this.challenges = [];
    this.updateCols();
    this.gameService.retrieveSpecs(this.currentGame?.id!).subscribe(
      r => {
        this.challenges = r;
      }
    );
    this.fetchFeedback();
  }

  updateChallenge(id: string) {
    console.log(id)
    if (id == "all") {
      this.currentChallenge = undefined;
    } else if (this.challenges) {
      this.currentChallenge = this.challenges?.find(g => g.id === id);
      
    }
    this.fetchFeedback();
  }

  updateType(type: string) {
    console.log(type)
    this.currentType = type;

    this.updateCols();

    this.fetchFeedback();
  }

  updateCols() {
    if (this.currentType == "game") {
      this.radioCols = this.currentGame?.feedbackTemplate?.board?.filter(q => q.type == QuestionType.radio);
      this.allCols = this.currentGame?.feedbackTemplate?.board;
    } else if (this.currentType == "challenge") {
      this.radioCols = this.currentGame?.feedbackTemplate?.challenge?.filter(q => q.type == QuestionType.radio);
      this.allCols = this.currentGame?.feedbackTemplate?.challenge;
    }
  }

  fetchFeedback() {
    this.feedback = undefined;
    this.search.type = this.currentType;
    this.search.gameId = this.currentGame?.id;
    this.search.challengeSpecId = this.currentChallenge?.id;
    console.log(this.search)
    let model:any = {};
    if (this.search.type)
      model.type = this.search.type;
    if (this.search.challengeSpecId)
      model.challengeSpecId = this.search.challengeSpecId;
    if (this.search.gameId)
      model.gameId = this.search.gameId;
    this.api.list(model).subscribe(
      r => {
        console.log(r);
        this.feedback = r;
        this.feedback = this.feedback.map(f => {
          f.radioQuestions = f.questions.filter(q => q.type == QuestionType.radio);
          f.textQuestions = f.questions.filter(q => q.type == QuestionType.text);
          return f;
        })
      }
    );
  }

  export(key: string) {
    if (key == "challenge") {
      this.reportService.exportFeedbackByChallengeSpec(this.currentChallenge.id);
    }
  }

  toggle(item: string) {
    if (item == 'summary')
      this.showSummary = !this.showSummary;
    if (item == 'table')
      this.showTable = !this.showTable;
    if (item == 'questions')
      this.showQuestions = !this.showQuestions;
  }

}
