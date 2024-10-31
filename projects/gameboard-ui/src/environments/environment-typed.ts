import { AppUserManagerSettings } from "@/utility/config.service";

export interface Environment {
    production: boolean;
    settingsJson?: string;
    settings: EnvironmentSettings;
}

export interface EnvironmentSettings {
    appname: string;
    apphost: string;
    basehref?: string;
    countdownStartSecondsAtMinute: number;
    custom_background?: string;
    imghost: string;
    isProduction: boolean;
    mkshost: string;
    oidc: AppUserManagerSettings;
    supporthost: string;
    tochost: string;
    tocfile?: string;
}
