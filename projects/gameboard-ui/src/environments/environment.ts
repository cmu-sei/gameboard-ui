// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  settings: {
    appname: 'Gameboard',
    apphost: 'http://localhost:5002',
    mkshost: 'http://localhost:4201',
    imghost: 'http://localhost:5002/img',
    tochost: 'http://localhost:5002/doc',
    supporthost: 'http://localhost:5002/supportfiles',
    tocfile: 'toc.json',
    countdownStartSecondsAtMinute: 5,
    oidc: {
      client_id: 'dev-code',
      // authority: 'http://localhost:5000',
      authority: 'https://devid.cmusei.dev',
      redirect_uri: 'http://localhost:4202/oidc',
      silent_redirect_uri: 'http://localhost:4202/assets/oidc-silent.html',
      response_type: 'code',
      scope: 'openid profile dev-api',
      accessTokenExpiringNotificationTime: 60,
      monitorSession: false,
      loadUserInfo: true,
      useLocalStorage: true
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
