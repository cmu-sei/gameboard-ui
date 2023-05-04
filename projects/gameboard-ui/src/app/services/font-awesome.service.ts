import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import {
  faArrowLeft,
  faBolt,
  faCheck,
  faCheckSquare,
  faChevronDown,
  faChevronUp,
  faClipboard,
  faCopy,
  faExclamationTriangle,
  faExternalLink,
  faFilter,
  faLongArrowAltDown,
  faPaperclip,
  faSquare,
  faStar,
  faSyncAlt,
  faEllipsisVertical,
  faGear,
  faList,
  faTriangleExclamation,
  faSearch,
  faShare,
  faTrash,
  IconDefinition,
  faShareAlt,
} from '@fortawesome/free-solid-svg-icons';

@Injectable({ providedIn: 'root' })
export class FontAwesomeService {
  arrowDown = faLongArrowAltDown;
  arrowLeft = faArrowLeft;
  bolt = faBolt;
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
  trash = faTrash;
  triangleExclamation = faTriangleExclamation;

  iconToSvg(icon: IconDefinition, width?: number, height?: number): SafeHtml {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width || 20}" height="${height || 20}" viewBox="0 0 384 512"><path d="${icon.icon[4].toString()}" /></svg>`
  }
}
