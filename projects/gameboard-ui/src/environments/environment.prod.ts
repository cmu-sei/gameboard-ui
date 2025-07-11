import { Environment } from "./environment-typed";

export const environment: Environment = {
  production: true,
  settingsJson: 'assets/settings.json',
  settings: {
    appname: 'Gameboard',
    apphost: '',
    countdownStartSecondsAtMinute: 5,
    imghost: '',
    isProduction: true,
    tochost: '',
    tocfile: 'toc.json',
    supporthost: '',
    custom_background: '',
    oidc: {
      authority: '',
      autoLogin: false,
      autoLogout: true,
      client_id: '',
      redirect_uri: ''
    },
  }
};
