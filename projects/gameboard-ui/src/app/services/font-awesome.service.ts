import { Inject, Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import {
  IconDefinition,
  faArrowLeft,
  faArrowUp,
  faBolt,
  faCaretDown,
  faCaretLeft,
  faCaretRight,
  faCaretUp,
  faCheck,
  faCheckSquare,
  faChevronDown,
  faChevronUp,
  faClipboard,
  faCloudUploadAlt,
  faComments,
  faCopy,
  faEllipsisVertical,
  faEraser,
  faExclamationCircle,
  faExclamationTriangle,
  faExternalLink,
  faFileDownload,
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
  faTv,
} from '@fortawesome/free-solid-svg-icons';

export const fa = {
  arrowDown: faLongArrowAltDown,
  arrowLeft: faArrowLeft,
  arrowUp: faArrowUp,
  bolt: faBolt,
  caretDown: faCaretDown,
  caretLeft: faCaretLeft,
  caretRight: faCaretRight,
  caretUp: faCaretUp,
  check: faCheck,
  checkSquare: faCheckSquare,
  chevronDown: faChevronDown,
  chevronUp: faChevronUp,
  clipboard: faClipboard,
  cloudUploadAlt: faCloudUploadAlt,
  comments: faComments,
  copy: faCopy,
  ellipsisVertical: faEllipsisVertical,
  eraser: faEraser,
  exclamationCircle: faExclamationCircle,
  exclamationTriangle: faExclamationTriangle,
  externalLink: faExternalLink,
  fileDownload: faFileDownload,
  filter: faFilter,
  list: faList,
  gear: faGear,
  paperclip: faPaperclip,
  search: faSearch,
  share: faShare,
  shareAlt: faShareAlt,
  star: faStar,
  square: faSquare,
  sync: faSyncAlt,
  times: faTimes,
  trash: faTrash,
  triangleExclamation: faTriangleExclamation,
  tv: faTv
};

export type FontAwesomeIcons = typeof fa;

@Injectable({ providedIn: 'root' })
export class FontAwesomeService {
  icons = fa;

  iconToSvg(icon: IconDefinition, width?: number, height?: number): SafeHtml {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width || 20}" height="${height || 20}" viewBox="0 0 384 512"><path d="${icon.icon[4].toString()}" /></svg>`;
  }
}
