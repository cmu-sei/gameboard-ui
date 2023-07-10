import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import {
  IconDefinition,
  faArrowLeft,
  faArrowUp,
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
  faEllipsisVertical,
  faExclamationTriangle,
  faExternalLink,
  faFilter,
  faGear,
  faList,
  faLongArrowAltDown,
  faPaperclip,
  faSearch,
  faShare,
  faShareAlt,
  faSquare,
  faStar,
  faSyncAlt,
  faTimes,
  faTrash,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

@Injectable({ providedIn: 'root' })
export class FontAwesomeService {
  arrowDown = faLongArrowAltDown;
  arrowLeft = faArrowLeft;
  arrowUp = faArrowUp;
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
  ellipsisVertical = faEllipsisVertical;
  exclamationTriangle = faExclamationTriangle;
  externalLink = faExternalLink;
  list = faList;
  filter = faFilter;
  gear = faGear;
  paperclip = faPaperclip;
  search = faSearch;
  share = faShare;
  shareAlt = faShareAlt;
  star = faStar;
  square = faSquare;
  sync = faSyncAlt;
  times = faTimes;
  trash = faTrash;
  triangleExclamation = faTriangleExclamation;

  iconToSvg(icon: IconDefinition, width?: number, height?: number): SafeHtml {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width || 20}" height="${height || 20}" viewBox="0 0 384 512"><path d="${icon.icon[4].toString()}" /></svg>`;
  }
}
