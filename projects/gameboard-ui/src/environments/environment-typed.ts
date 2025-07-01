import { AppUserManagerSettings } from "@/utility/config.service";
import { ConsoleForgeConfig } from "@cmusei/console-forge/lib/config/console-forge-config";

export interface Environment {
    production: boolean;
    settingsJson?: string;
    settings: EnvironmentSettings;
}

export interface EnvironmentSettings {
    appname: string;
    apphost: string;
    basehref?: string;
    consoleForgeConfig?: Partial<ConsoleForgeConfig>;
    countdownStartSecondsAtMinute: number;
    custom_background?: string;
    imghost: string;
    isProduction: boolean;
    oidc: AppUserManagerSettings;
    supporthost: string;
    tochost: string;
    tocfile?: string;
}
