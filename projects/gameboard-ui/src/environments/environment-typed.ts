// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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
    HeaderBarSettings?: Partial<HeaderBarSettings> | null;
    imghost: string;
    isProduction: boolean;
    oidc: AppUserManagerSettings;
    supporthost: string;
    tochost: string;
    tocfile?: string;
}

// The same shape the other Crucible apps read for their classification banner
// (HeaderBarSettings in the shared UI settings), so one block configures all of them.
export interface HeaderBarSettings {
    enabled: boolean;
    banner_background_color: string;
    classification_text: string;
    classification_text_color: string;
    classification_text_fontsize: string;
    message_text: string;
    message_text_color: string;
    message_text_fontsize: string;
}
