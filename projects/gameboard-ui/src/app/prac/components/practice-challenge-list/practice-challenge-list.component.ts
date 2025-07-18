import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Observable, combineLatest, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { slug } from '@/../tools/functions';
import { ApiUser } from '@/api/user-models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { AuthService } from '@/utility/auth.service';
import { PracticeChallengeView, SearchPracticeChallengesRequest, UserPracticeSummary } from '@/prac/practice.models';
import { fa } from '@/services/font-awesome.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
    selector: 'app-practice-challenge-list',
    templateUrl: './practice-challenge-list.component.html',
    styleUrls: ['./practice-challenge-list.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class PracticeChallengeListComponent {
  list$: Observable<PracticeChallengeView[]>;
  appname = '';
  faSearch = faSearch;

  protected canPlayChallenges = false;
  protected cantPlayChallengesTooltip: string | null = null;
  protected fa = fa;
  protected hasSponsor$: Observable<boolean>;
  protected introTextMarkdown = "";
  protected isLoading = false;
  protected localUser$: Observable<ApiUser | null>;
  protected profileRouterLink: string;
  protected suggestedSearches: string[] = [];
  protected userPracticeSummary?: UserPracticeSummary;

  @ViewChild("userSummaryModal") protected userSummaryModal?: TemplateRef<any>;

  term = "";
  count = 0;
  skip = 0;
  take = 1;
  protected slug = slug;

  private static readonly DEFAULT_PAGE_SIZE = 100;

  constructor(
    localUser: LocalUserService,
    private api: PracticeService,
    private authService: AuthService,
    private modalService: ModalConfirmService,
    protected route: ActivatedRoute,
    private routerService: RouterService,
    private unsub: UnsubscriberService
  ) {

    this.list$ = route.queryParams.pipe(
      map(queryParams => ({
        filter: {
          skip: queryParams.skip,
          take: queryParams.take || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE,
          term: queryParams.term
        },
        userProgress: queryParams.userProgress
      } as SearchPracticeChallengesRequest)),
      tap(m => this.isLoading = true),
      switchMap(m => api.searchChallenges(m)),
      tap(r => {
        this.isLoading = false;
        this.count = r.results.paging.itemCount;
        this.skip = (r.results.paging.pageNumber || 0) * (r.results.paging.pageSize || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE);
        this.take = r.results.paging.pageSize || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE;
        this.term = route.snapshot.queryParams.term || "";
      }),
      map(results => results.results.items),
      tap(() => {
        // automatically close the "user summary" modal, because it initiates navigation sometimes and we want to present
        // the results
        this.modalService.hide();
      })
    );

    this.hasSponsor$ = localUser.user$.pipe(map(u => !!u?.sponsor && !u.hasDefaultSponsor));
    this.localUser$ = localUser.user$;
    this.profileRouterLink = this.routerService.getProfileUrl();

    this.unsub.add(
      combineLatest([
        this.hasSponsor$,
        this.localUser$
      ]).pipe(
        map((sponsorAndUser) => ({ hasSponsor: sponsorAndUser[0], hasLocalUser: !!sponsorAndUser[1] }))
      ).subscribe(async ctx => {
        this.canPlayChallenges = ctx.hasLocalUser && ctx.hasSponsor;
        this.cantPlayChallengesTooltip = null;

        if (ctx.hasLocalUser) {
          this.userPracticeSummary = await this.api.getUserPracticeSummary(localUser.user$.value!.id);
        }

        if (!ctx.hasLocalUser) {
          this.cantPlayChallengesTooltip = "Come back after logging in to play this challenge.";
        } else if (!ctx.hasSponsor) {
          this.cantPlayChallengesTooltip = "Come back after selecting your sponsor to play this challenge.";
        }
      })
    );
  }

  async ngOnInit(): Promise<void> {
    const settings = await firstValueFrom(this.api.getSettings());
    this.introTextMarkdown = settings.introTextMarkdown;
    this.suggestedSearches = settings.suggestedSearches;
  }

  paged(s: number): void {
    this.routerService.updateQueryParams({ parameters: { skip: s, navigate: true } });
  }

  protected async handleLogIn() {
    await this.authService.login(this.routerService.getPracticeAreaUrl().toString());
  }

  protected handleViewSummaryClick() {
    if (!this.userSummaryModal) {
      return;
    }

    this.modalService.openTemplate(this.userSummaryModal);
  }
}
