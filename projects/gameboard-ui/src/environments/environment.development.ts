export const environment = {
    production: false,
    settings: {
        appname: "Gameboard (Dev)",
        apphost: 'http://localhost:5002',
        mkshost: 'http://localhost:4201',
        imghost: 'http://localhost:5002/img',
        tochost: 'http://localhost:5002/doc',
        supporthost: 'http://localhost:5002/supportfiles',
        gamebrainhost: 'https://launchpad.cisa.gov/test/gamebrain/api',
        unityhost: 'https://launchpad.cisa.gov/test/cubespace',
        countdownStartSecondsAtMinute: 5,
        oidc: {
            "client_id": "gameboard-ui-dev",
            "authority": "https://foundry.local/identity",
            "redirect_uri": "http://localhost:4202/oidc",
            "silent_redirect_uri": "http://localhost:4202/oidc-silent.html",
            "response_type": "code",
            "scope": "openid profile organization gameboard-api",
            "monitorSession": true,
            "automaticSilentRenew": true,
            "loadUserInfo": true,
            "checkSessionInterval": 30000,
            "useLocalStorage": true,
            "accessTokenExpiringNotificationTime": 120
        }
    }
}
