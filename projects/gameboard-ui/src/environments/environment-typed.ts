// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AppUserManagerSettings } from "@/utility/config.service";
import { provideConsoleForge } from "@cmusei/console-forge";

// console-forge doesn't export its config type from the package root, so take it from provideConsoleForge.
type ConsoleForgeConfig = NonNullable<Parameters<typeof provideConsoleForge>[0]>;

export interface Environment {
    production: boolean;
    settingsJson?: string;
    settings: EnvironmentSettings;
}

export interface EnvironmentSettings {
    appname: string;
    apphost: string;
    basehref?: string;
    consoleForgeConfig?: ConsoleForgeConfig;
    countdownStartSecondsAtMinute: number;
    custom_background?: string;
    imghost: string;
    isProduction: boolean;
    oidc: AppUserManagerSettings;
    supporthost: string;
    tochost: string;
    tocfile?: string;
}
