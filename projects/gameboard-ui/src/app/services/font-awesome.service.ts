import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import {
  IconDefinition,
  faArrowLeft,
  faArrowsSpin,
  faArrowUp,
  faBars,
  faBarsStaggered,
  faBook,
  faBolt,
  faCaretDown,
  faCaretLeft,
  faCaretRight,
  faCaretUp,
  faCheck,
  faCheckSquare,
  faChessBoard,
  faChevronDown,
  faChevronUp,
  faCircleArrowUp,
  faCirclePlay,
  faCircleUser,
  faClipboard,
  faClock,
  faCloudUploadAlt,
  faComments,
  faComputer,
  faCopy,
  faEdit,
  faEllipsis,
  faEllipsisVertical,
  faEnvelope,
  faEraser,
  faExclamationCircle,
  faExclamationTriangle,
  faExternalLink,
  faExternalLinkAlt,
  faEye,
  faEyeSlash,
  faFileCsv,
  faFileDownload,
  faFileExport,
  faFilter,
  faGamepad,
  faGear,
  faHourglassStart,
  faInfoCircle,
  faList,
  faListOl,
  faLongArrowAltDown,
  faMapMarker,
  faPaperclip,
  faPaste,
  faPencilSquare,
  faPeopleGroup,
  faPerson,
  faPlay,
  faPlus,
  faRecycle,
  faRocket,
  faSearch,
  faShare,
  faShareAlt,
  faSquare,
  faSquarePersonConfined,
  faStar,
  faStop,
  faSyncAlt,
  faTable,
  faTicket,
  faTimes,
  faToggleOff,
  faToggleOn,
  faTowerBroadcast,
  faTrash,
  faTriangleExclamation,
  faTv,
  faUser,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faOpenid } from "@fortawesome/free-brands-svg-icons";

export const fa = {
  arrowDown: faLongArrowAltDown,
  arrowLeft: faArrowLeft,
  arrowsSpin: faArrowsSpin,
  arrowUp: faArrowUp,
  bars: faBars,
  barsStaggered: faBarsStaggered,
  bolt: faBolt,
  book: faBook,
  caretDown: faCaretDown,
  caretLeft: faCaretLeft,
  caretRight: faCaretRight,
  caretUp: faCaretUp,
  check: faCheck,
  checkSquare: faCheckSquare,
  chessBoard: faChessBoard,
  chevronDown: faChevronDown,
  chevronUp: faChevronUp,
  circleArrowUp: faCircleArrowUp,
  circlePlay: faCirclePlay,
  circleUser: faCircleUser,
  clipboard: faClipboard,
  clock: faClock,
  cloudUploadAlt: faCloudUploadAlt,
  comments: faComments,
  computer: faComputer,
  copy: faCopy,
  edit: faEdit,
  ellipsis: faEllipsis,
  ellipsisVertical: faEllipsisVertical,
  envelope: faEnvelope,
  eraser: faEraser,
  exclamationCircle: faExclamationCircle,
  exclamationTriangle: faExclamationTriangle,
  externalLink: faExternalLink,
  externalLinkAlt: faExternalLinkAlt,
  eye: faEye,
  eyeSlash: faEyeSlash,
  fileCsv: faFileCsv,
  fileDownload: faFileDownload,
  fileExport: faFileExport,
  filter: faFilter,
  list: faList,
  listOl: faListOl,
  gamepad: faGamepad,
  gear: faGear,
  hourglassStart: faHourglassStart,
  infoCircle: faInfoCircle,
  mapMarker: faMapMarker,
  openId: faOpenid,
  paperclip: faPaperclip,
  paste: faPaste,
  peopleGroup: faPeopleGroup,
  pencilSquare: faPencilSquare,
  person: faPerson,
  play: faPlay,
  plus: faPlus,
  recycle: faRecycle,
  rocket: faRocket,
  search: faSearch,
  share: faShare,
  shareAlt: faShareAlt,
  star: faStar,
  square: faSquare,
  squarePersonConfined: faSquarePersonConfined,
  stop: faStop,
  sync: faSyncAlt,
  ticket: faTicket,
  times: faTimes,
  table: faTable,
  toggleOff: faToggleOff,
  toggleOn: faToggleOn,
  towerBroadcast: faTowerBroadcast,
  trash: faTrash,
  triangleExclamation: faTriangleExclamation,
  tv: faTv,
  user: faUser,
  users: faUsers,
  xMark: faXmark
};

export type FontAwesomeIcons = typeof fa;

@Injectable({ providedIn: 'root' })
export class FontAwesomeService {
  iconToSvg(icon: IconDefinition, width?: number, height?: number): SafeHtml {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width || 20}" height="${height || 20}" viewBox="0 0 384 512"><path d="${icon.icon[4].toString()}" /></svg>`;
  }
}
