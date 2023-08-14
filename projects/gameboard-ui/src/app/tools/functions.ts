export function slug(input: string): string {
    return input.replace(/[^a-zA-Z0-9]+/igm, '-').toLowerCase();
}
