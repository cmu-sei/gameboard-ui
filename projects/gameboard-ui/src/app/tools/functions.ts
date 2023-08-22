export function buildUrl(...urlBits: string[]): string | null {
    if (!urlBits?.length)
        return null;

    let url = urlBits[0];

    if (urlBits.length > 1) {
        if (!url.endsWith('/'))
            url += url + "/";

        for (const bit of urlBits) {
            url += bit.endsWith("/") ? bit : bit + "/";
        }

        return url.endsWith("/") ? url.substring(0, url.length - 1) : url;
    }

    return url;
}

export function slug(input: string): string {
    return input.replace(/[^a-zA-Z0-9]+/igm, '-').toLowerCase();
}
