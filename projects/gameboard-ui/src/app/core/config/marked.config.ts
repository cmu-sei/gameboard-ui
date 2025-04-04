import { MarkedOptions, MarkedRenderer } from "ngx-markdown";

export function markedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();

    renderer.image = (href, title, text) => {
        return `<div class="text-center"><img class="img-fluid rounded" src=${href} alt="${text}" /></div>`;
    };

    renderer.link = (href, title, text) => {
        return `<a role="link" target="_blank" href="${href}" rel="nofollow noopener noreferrer">${text}</a>`;
    };

    renderer.blockquote = (quote) => {
        return `<blockquote class="blockquote">${quote}</blockquote>`;
    };

    renderer.table = (header, body) => {
        return `<table class="table table-striped"><thead>${header}</thead><tbody>${body}</tbody></table>`;
    };

    return {
        renderer,
        gfm: true,
        breaks: false,
        pedantic: false
    };
}
