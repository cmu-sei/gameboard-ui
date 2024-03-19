import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ngx bootstrap
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

// other 3rd party modules
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { NgChartsModule } from 'ng2-charts';
// import luxon adapter for chartjs
import 'chartjs-adapter-luxon';

// configuration
import { markedOptionsFactory } from './config/marked.config';

// internal components/pipes/directives
import { AbsoluteValuePipe } from './pipes/absolute-value.pipe';
import { AddDurationPipe } from './pipes/add-duration.pipe';
import { ApiDatePipe } from './pipes/api-date.pipe';
import { ApiUrlPipe } from './pipes/api-url.pipe';
import { ArrayContainsPipe } from './pipes/array-contains.pipe';
import { ArrayToCountPipe } from './pipes/array-to-count.pipe';
import { AssetPathPipe } from './pipes/asset-path.pipe';
import { AutofocusDirective } from './directives/autofocus.directive';
import { AvatarChipComponent } from './components/avatar-chip/avatar-chip.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { BigStatComponent } from './components/big-stat/big-stat.component';
import { CamelspacePipe } from './pipes/camelspace.pipe';
import { ChallengeResultColorPipe } from './pipes/challenge-result-color.pipe';
import { ChallengeResultPrettyPipe } from './pipes/challenge-result-pretty.pipe';
import { ChallengeSolutionGuideComponent } from './components/challenge-solution-guide/challenge-solution-guide.component';
import { ClockPipe } from './pipes/clock.pipe';
import { ColoredTextChipComponent } from './components/colored-text-chip/colored-text-chip.component';
import { CopyOnClickDirective } from './directives/copy-on-click.directive';
import { ConfirmButtonComponent } from '@/core/components/confirm-button/confirm-button.component';
import { CountdownColorPipe } from './pipes/countdown-color.pipe';
import { CountdownComponent } from './components/countdown/countdown.component';
import { CountdownPipe } from './pipes/countdown.pipe';
import { CumulativeTimeClockComponent } from './components/cumulative-time-clock/cumulative-time-clock.component';
import { DateToCountdownPipe } from './pipes/date-to-countdown.pipe';
import { DateTimeIsPastPipe } from './pipes/datetime-is-past.pipe';
import { DatetimeToDatePipe } from './pipes/datetime-to-date.pipe';
import { DateToDatetimePipe } from './pipes/date-to-datetime.pipe';
import { DelimitedPipe } from './pipes/delimited.pipe';
import { DoughnutChartComponent } from './components/doughnut-chart/doughnut-chart.component';
import { DropzoneComponent } from './components/dropzone/dropzone.component';
import { ErrorDivComponent } from './components/error-div/error-div.component';
import { FeedbackFormComponent } from './components/feedback-form/feedback-form.component';
import { FilterPipe } from './pipes/filter.pipe';
import { FriendlyDateAndTimePipe } from './pipes/friendly-date-and-time.pipe';
import { FriendlyTimePipe } from './pipes/friendly-time.pipe';
import { GameboardPerformanceSummaryComponent } from './components/gameboard-performance-summary/gameboard-performance-summary.component';
import { GameCardImageComponent } from './components/game-card-image/game-card-image.component';
import { GbProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { LinkRendererPipe } from './pipes/link-renderer.pipe';
import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { MinPipe } from './pipes/min.pipe';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { ModalConfirmDirective } from './components/modal/modal-confirm.directive';
import { ModalContentComponent } from './components/modal-content/modal-content.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { MsToDurationPipe } from './pipes/ms-to-duration.pipe';
import { NumbersToPercentage } from './pipes/numbers-to-percentage.pipe';
import { PagerComponent } from './components/pager/pager.component';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { PlayerAvatarLegacyComponent } from './components/player-avatar-legacy/player-avatar-legacy.component';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { PlayerStatusComponent } from './components/player-status/player-status.component';
import { PluralizerPipe } from './pipes/pluralizer.pipe';
import { QueryParamModelDirective } from './directives/query-param-model.directive';
import { RelativeImagePipe } from './pipes/relative-image.pipe';
import { RelativeToAbsoluteHrefPipe } from './pipes/relative-to-absolute-href.pipe';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { RenderLinksInTextComponent } from './components/render-links-in-text/render-links-in-text.component';
import { SelectPagerComponent } from './components/select-pager/select-pager.component';
import { ShareButtonComponent } from './components/share-button/share-button.component';
import { ShortDatePipe } from './pipes/short-date.pipe';
import { SimpleEntitiesToTooltipPipe } from './pipes/simple-entities-to-tooltip.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SponsoredEntitiesToSponsorsPipe } from './pipes/sponsored-entities-to-sponsors.pipe';
import { SponsorToLogoUriPipe } from './pipes/sponsor-to-logo-uri.pipe';
import { SponsorsToLogoUrisPipe } from './pipes/sponsors-to-logo-uris.pipe';
import { SponsorLogoFileNamesToUrisPipe } from './pipes/sponsor-logo-file-names-to-uris.pipe';
import { StatusLightComponent } from './components/status-light/status-light.component';
import { SumArrayPipe } from './pipes/sum-array.pipe';
import { TextToColorPipe } from './pipes/text-to-color.pipe';
import { TicketStatusBadgePipe } from './pipes/ticket-status-badge.pipe';
import { ToSupportCodePipe } from './pipes/to-support-code.pipe';
import { ToggleClassPipe } from './pipes/toggle-class.pipe';
import { ToggleSwitchComponent } from './components/toggle-switch/toggle-switch.component';
import { ToTemplateContextPipe } from './pipes/to-template-context.pipe';
import { TrimPipe } from './pipes/trim.pipe';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { WhitespacePipe } from './pipes/whitespace.pipe';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { YamlPipe } from './pipes/yaml.pipe';

const PUBLIC_DECLARATIONS = [
  AbsoluteValuePipe,
  AddDurationPipe,
  ApiDatePipe,
  ApiUrlPipe,
  ArrayContainsPipe,
  ArrayToCountPipe,
  AssetPathPipe,
  AutofocusDirective,
  AvatarComponent,
  AvatarChipComponent,
  BigStatComponent,
  CamelspacePipe,
  ChallengeResultColorPipe,
  ChallengeResultPrettyPipe,
  ChallengeSolutionGuideComponent,
  ColoredTextChipComponent,
  ConfirmButtonComponent,
  CopyOnClickDirective,
  CountdownComponent,
  CumulativeTimeClockComponent,
  DateToCountdownPipe,
  DateToDatetimePipe,
  DateTimeIsPastPipe,
  DatetimeToDatePipe,
  DelimitedPipe,
  DoughnutChartComponent,
  DropzoneComponent,
  ErrorDivComponent,
  FeedbackFormComponent,
  FriendlyDateAndTimePipe,
  GameboardPerformanceSummaryComponent,
  GameCardImageComponent,
  GbProgressBarComponent,
  LineChartComponent,
  LinkRendererPipe,
  LongContentHiderComponent,
  ModalConfirmComponent,
  ModalConfirmDirective,
  MsToDurationPipe,
  MultiSelectComponent,
  PagerComponent,
  PlayerAvatarComponent,
  PlayerAvatarLegacyComponent,
  PlayerAvatarListComponent,
  PlayerStatusComponent,
  NumbersToPercentage,
  QueryParamModelDirective,
  RelativeUrlsPipe,
  RenderLinksInTextComponent,
  SpinnerComponent,
  ToggleSwitchComponent,
  TrimPipe,
  UrlRewritePipe,
  ClockPipe,
  CountdownPipe,
  CountdownColorPipe,
  FilterPipe,
  FriendlyTimePipe,
  MinPipe,
  ModalContentComponent,
  PluralizerPipe,
  RenderLinksInTextComponent,
  RelativeImagePipe,
  RelativeToAbsoluteHrefPipe,
  RelativeUrlsPipe,
  SelectPagerComponent,
  ShareButtonComponent,
  ShortDatePipe,
  SimpleEntitiesToTooltipPipe,
  SortPipe,
  SpinnerComponent,
  SponsoredEntitiesToSponsorsPipe,
  SponsorToLogoUriPipe,
  SponsorsToLogoUrisPipe,
  SponsorLogoFileNamesToUrisPipe,
  StatusLightComponent,
  SumArrayPipe,
  TextToColorPipe,
  ToggleClassPipe,
  ToSupportCodePipe,
  ToTemplateContextPipe,
  TicketStatusBadgePipe,
  UrlRewritePipe,
  WhitespacePipe,
  YamlBlockComponent,
  YamlPipe
];

const RELAYED_MODULES = [
  AlertModule,
  BsDatepickerModule,
  BsDropdownModule,
  ButtonsModule,
  CollapseModule,
  FontAwesomeModule,
  FormsModule,
  MarkdownModule,
  ModalModule,
  NgChartsModule,
  PopoverModule,
  RouterModule,
  TabsModule,
  TooltipModule,
  TypeaheadModule
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProgressbarModule,
    TooltipModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    PopoverModule.forRoot(),
    TypeaheadModule.forRoot(),
    ...RELAYED_MODULES
  ],
  exports: [
    ...RELAYED_MODULES,
    ...PUBLIC_DECLARATIONS,
  ]
})
export class CoreModule { }
