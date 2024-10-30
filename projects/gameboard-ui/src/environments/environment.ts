import { Environment } from "./environment-typed";

export const environment: Environment = {
  production: false,
  settings: {
    appname: 'Gameboard',
    apphost: 'http://localhost:5002',
    basehref: "gb",
    mkshost: 'http://localhost:4201',
    imghost: 'http://localhost:5002/img',
    tochost: 'http://localhost:5002/doc',
    supporthost: 'http://localhost:5002/supportfiles',
    tocfile: '',
    countdownStartSecondsAtMinute: 5,
    custom_background: 'custom-bg-blue',
    isProduction: false,
    oidc: {
      authority: 'http://localhost:8080/realms/foundry',
      autoLogin: true,
      client_id: 'dev.gameboard.web',
      logoutOnAppLogout: true,
      redirect_uri: 'http://localhost:4202/oidc',
      silent_redirect_uri: 'http://localhost:4202/assets/oidc-silent.html',
      response_type: 'code',
      scope: 'openid profile gameboard-api',
      loadUserInfo: true,
      useLocalStorage: true
    },
  }
};
