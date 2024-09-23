export interface Environment {
    production: boolean;
    settingsJson?: string;
    settings: {
        appname: string,
        apphost: string,
        basehref?: string,
        mkshost: string,
        imghost: string,
        tochost: string,
        supporthost: string,
        tocfile?: string,
        countdownStartSecondsAtMinute: number,
        custom_background?: string,
        isProduction: boolean,
        oidc: {
            client_id: string,
            authority: string,
            redirect_uri: string,
            silent_redirect_uri?: string,
            response_type?: string,
            scope?: string,
            loadUserInfo?: boolean,
            useLocalStorage?: boolean
        }
    }
}
