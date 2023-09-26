import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { fa } from "@/services/font-awesome.service";
import { Sponsor, SponsorWithChildSponsors } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterService } from '@/services/router.service';
import { unique } from 'projects/gameboard-ui/src/tools';

@Component({
  selector: 'app-parameter-sponsor',
  templateUrl: './parameter-sponsor.component.html',
  styleUrls: ['./parameter-sponsor.component.scss']
})
export class ParameterSponsorComponent implements OnInit {
  @Input() queryParamName = "sponsors";
  @Input() searchText = "";
  @Input() showSearchBoxThreshold = 6;
  @Input() showSelectionSummaryThreshold = 0;

  protected selectedItemsDisplayedThreshold = 4;
  protected countSelectedOverDisplayThreshold = 0;
  protected fa = fa;
  protected selectionSummary = "";
  protected allSponsors: SponsorWithChildSponsors[] = [];
  private static QUERYSTRING_VALUE_DELIMITER = ",";

  constructor(
    private markdownHelpers: MarkdownHelpersService,
    private modalService: ModalConfirmService,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private sponsorService: SponsorService,
    private unsub: UnsubscriberService) { }

  async ngOnInit(): Promise<void> {
    this.allSponsors = await firstValueFrom(this.sponsorService.listWithChildren());

    this.unsub.add(
      this.route.queryParamMap.subscribe(async p => {
        const queryParamSponsorIds = (p.get(this.queryParamName) || "")
          .split(ParameterSponsorComponent.QUERYSTRING_VALUE_DELIMITER);

        await this.updateSelectedSponsors(
          queryParamSponsorIds
            .map(id => this.getSponsorForId(id))
            .filter(s => !!s) as Sponsor[]
        );
      })
    );
  }

  protected get selectedSponsors(): Sponsor[] {
    const paramValue = this.route.snapshot.queryParamMap.get(this.queryParamName);
    if (!paramValue)
      return [];

    const parsedParamValue = paramValue.split(ParameterSponsorComponent.QUERYSTRING_VALUE_DELIMITER);
    return parsedParamValue
      .map(v => this.getSponsorForId(v))
      .filter(s => !!s) as Sponsor[];
  }

  updateSelectionSummary(selectedItemValues: Sponsor[]): void {
    if (!selectedItemValues?.length) {
      this.selectionSummary = "";
      this.countSelectedOverDisplayThreshold = 0;
      return;
    }

    const summary = this.selectedSponsors
      .map(i => i.name)
      .slice(0, this.selectedItemsDisplayedThreshold).join(", ");

    this.countSelectedOverDisplayThreshold = Math.max(selectedItemValues.length - this.selectedItemsDisplayedThreshold, 0);
    this.selectionSummary = summary;
  }

  async handleCheckedChanged(option: Sponsor | SponsorWithChildSponsors, event: any) {
    const isChecked = (event.target as any).checked;
    const sponsorsToAddOrRemove = [option];

    // if a parent is being checked/unchecked, adjust its children to have the same selection
    for (const childSponsor of (option as SponsorWithChildSponsors).childSponsors || []) {
      sponsorsToAddOrRemove.push(childSponsor);
    }

    if (!isChecked) {
      // if the box isn't checked, we must be removing an item
      await this.updateSelectedSponsors([...this.selectedSponsors.filter(s => !sponsorsToAddOrRemove.some(toRemove => toRemove.id === s.id))]);
      return;
    } else {
      // if we're not removing, we must be adding
      await this.updateSelectedSponsors([...this.selectedSponsors, ...sponsorsToAddOrRemove]);
    }
  }

  protected getOptionIsChecked(option: Sponsor) {
    return this.selectedSponsors.some(s => s.id === option.id) || false;
  }

  protected getOptionVisibility(option: Sponsor) {
    if (!this.searchText) {
      return true;
    }

    const optionText = option.name.toLowerCase();
    return optionText.indexOf(this.searchText.toLowerCase()) >= 0;
  }

  protected async handleClearClicked() {
    await this.updateSelectedSponsors([]);
  }

  protected handleSelectedOverDisplayThresholdClicked() {
    const displaySelectedOptions = this
      .selectedSponsors
      .map(o => o.name);

    // sort works in place, so we have to do this separately
    displaySelectedOptions.sort();

    // then transform to markdown so we can render as a bulleted list
    this.modalService.openConfirm({
      title: `Selected Sponsors`,
      hideCancel: true,
      renderBodyAsMarkdown: true,
      bodyContent: this.markdownHelpers.arrayToBulletList(displaySelectedOptions)
    });
  }

  // we use this to constrain or resolve ids coming into/out of the query string and line them up with real sponsors
  // it's a little trickier than a single statement because some sponsors have child sponsors, so we have to check
  // those too
  private getSponsorForId(sponsorId: string): Sponsor | null {
    for (let sponsor of this.allSponsors) {
      if (sponsor.id === sponsorId) {
        return sponsor;
      }

      const childWithThisId = sponsor.childSponsors.find(c => c.id === sponsorId);
      if (childWithThisId)
        return childWithThisId;
    }

    return null;
  }

  private async updateSelectedSponsors(value: Sponsor[]): Promise<void> {
    const validSponsorIds = unique(
      value
        .map(v => v.id)
        .filter(sId => !!this.getSponsorForId(sId))
    );

    const params: Params = {};
    params[this.queryParamName] = validSponsorIds.join(ParameterSponsorComponent.QUERYSTRING_VALUE_DELIMITER);
    await this.routerService.updateQueryParams({ parameters: params });
    this.updateSelectionSummary(this.selectedSponsors);
  }
}
