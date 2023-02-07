export const environment = {
  production: false,
  settings: {
    appname: 'Gameboard',
    apphost: 'http://localhost:5002',
    mkshost: 'http://localhost:4201',
    imghost: 'http://localhost:5002/img',
    tochost: 'http://localhost:5002/doc',
    supporthost: 'http://localhost:5002/supportfiles',
    gamebrainhost: '',
    unityhost: '',
    tocfile: 'toc.json',
    countdownStartSecondsAtMinute: 5,
    isProduction: false,
    oidc: {
      client_id: 'gameboard-ui-dev',
      authority: 'https://foundry.local/identity',
      redirect_uri: 'http://localhost:4202/oidc',
      silent_redirect_uri: 'http://localhost:4202/assets/oidc-silent.html',
      response_type: 'code',
      scope: 'openid profile gameboard-api',
      accessTokenExpiringNotificationTime: 60,
      monitorSession: false,
      loadUserInfo: true,
      useLocalStorage: true
    }
  }
};
