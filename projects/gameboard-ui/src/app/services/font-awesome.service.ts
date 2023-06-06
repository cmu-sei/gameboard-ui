import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import {
  faArrowLeft,
  faAward,
  faBolt,
  faCaretDown,
  faCaretRight,
  faCaretUp,
  faCheck,
  faCheckSquare,
  faChevronDown,
  faChevronUp,
  faClipboard,
  faCopy,
  faEdit,
  faExclamationTriangle,
  faExternalLink,
  faExternalLinkAlt,
  faFilter,
  faListOl,
  faLongArrowAltDown,
  faMapMarker,
  faSquare,
  faStar,
  faSyncAlt,
  faEllipsisVertical,
  faGear,
  faList,
  faTriangleExclamation,
  faSearch,
  faTrash,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

@Injectable({ providedIn: 'root' })
export class FontAwesomeService {
  arrowDown = faLongArrowAltDown;
  arrowLeft = faArrowLeft;
  award = faAward;
  bolt = faBolt;
  caretDown = faCaretDown;
  caretRight = faCaretRight;
  caretUp = faCaretUp;
  check = faCheck;
  checkSquare = faCheckSquare;
  chevronDown = faChevronDown;
  chevronUp = faChevronUp;
  clipboard = faClipboard;
  copy = faCopy;
  edit = faEdit;
  ellipsisVertical = faEllipsisVertical;
  exclamationTriangle = faExclamationTriangle;
  externalLink = faExternalLink;
  externalLinkAlt = faExternalLinkAlt;
  list = faList;
  listOl = faListOl;
  filter = faFilter;
  gear = faGear;
  mapMarker = faMapMarker;
  search = faSearch;
  star = faStar;
  square = faSquare;
  sync = faSyncAlt;
  trash = faTrash;
  triangleExclamation = faTriangleExclamation;

  iconToSvg(icon: IconDefinition, width?: number, height?: number): SafeHtml {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width || 20}" height="${height || 20}" viewBox="0 0 384 512"><path d="${icon.icon[4].toString()}" /></svg>`;
  }
}
