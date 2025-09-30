// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { FormGroup, ValidationErrors } from "@angular/forms";

export function buildUrl(...urlBits: string[]): string | null {
    if (!urlBits?.length)
        return null;

    let url = "";

    for (const bit of urlBits) {
        url += bit.endsWith("/") ? bit : bit + "/";
    }

    return url.substring(0, url.length - 1);
}

export function eventTargetValueToString(input: string | Event): string | null {
    if (!input) {
        return null;
    }

    if (typeof input === "string" || input instanceof String) {
        return input.toString();
    }

    return ((input as Event)?.target as HTMLInputElement)?.value || null;
}

export function hasProperty<T extends {}>(object: T, property: keyof T) {
    return object ? Object.keys(object).some(k => k === property) : false;
}

export function isObject<T>(thing: T): boolean {
    return typeof thing === "object" &&
        !Array.isArray(thing) &&
        !!thing;
}

export function slug(input: string): string {
    if (!input) {
        return input;
    }

    return input
        .trim()
        .replace(/[^a-zA-Z0-9]+/igm, '-')
        .replace(/-^/, "")
        .replace(/$-/, "")
        .toLowerCase();
}
