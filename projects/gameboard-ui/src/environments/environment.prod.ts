import { Environment } from "./environment-typed";

export const environment: Environment = {
  production: true,
  settingsJson: 'assets/settings.json',
  settings: {
    appname: 'Gameboard',
    apphost: '',
    countdownStartSecondsAtMinute: 5,
    mkshost: '',
    imghost: '',
    isProduction: true,
    tochost: '',
    tocfile: 'toc.json',
    supporthost: '',
    custom_background: '',
    oidc: {
      authority: '',
      client_id: '',
      redirect_uri: ''
    }
  }
};
