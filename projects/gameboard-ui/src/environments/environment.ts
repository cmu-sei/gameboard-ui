import { LogLevel } from "@cmusei/console-forge";
import { Environment } from "./environment-typed";

export const environment: Environment = {
  production: false,
  settingsJson: undefined,
  settings: {
    appname: 'Gameboard',
    apphost: 'http://localhost:5002',
    basehref: "gb",
    imghost: 'http://localhost:5002/img',
    tochost: 'http://localhost:5002/doc',
    supporthost: 'http://localhost:5002/supportfiles',
    tocfile: '',
    countdownStartSecondsAtMinute: 5,
    custom_background: 'custom-bg-dark-gray',
    isProduction: false,
    consoleForgeConfig: {
      consoleBackgroundStyle: "rgb(0, 0, 0)",
      defaultConsoleClientType: "vnc",
      logThreshold: LogLevel.DEBUG,
      showBrowserNotificationsOnConsoleEvents: true
    },
    oidc: {
      authority: 'http://localhost:8080/realms/foundry',
      client_id: 'dev.gameboard.web',
      redirect_uri: 'http://localhost:4202/oidc',
      silent_redirect_uri: 'http://localhost:4202/assets/oidc-silent.html',
      response_type: 'code',
      scope: 'openid profile gameboard-api',
      loadUserInfo: true,
      useLocalStorage: true
    },
  }
};
