export const environment = {
  production: false,
  settingsJson: null,
  settings: {
    appname: 'Gameboard',
    apphost: 'http://localhost:5002',
    mkshost: 'http://localhost:4201',
    imghost: 'http://localhost:5002/img',
    tochost: 'http://localhost:5002/doc',
    supporthost: 'http://localhost:5002/supportfiles',
    gamebrainhost: '',
    unityhost: '',
    tocfile: '',
    countdownStartSecondsAtMinute: 5,
    custom_background: 'custom-bg-blue',
    isProduction: false,
    oidc: {
      client_id: 'gameboard-ui-dev',
      authority: 'https://foundry.local/identity',
      redirect_uri: 'http://localhost:4202/oidc',
      silent_redirect_uri: 'http://localhost:4202/assets/oidc-silent.html',
      response_type: 'code',
      scope: 'openid profile gameboard-api',
      loadUserInfo: true,
      useLocalStorage: true
    }
  }
};
