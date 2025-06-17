import { MarkedOptions, MarkedRenderer } from "ngx-markdown";

export function markedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();

    renderer.image = ({ href, title, text }) => {
        return `<div class="text-center"><img class="img-fluid rounded" src=${href} alt="${text}" /></div>`;
    };

    renderer.link = ({ href, title, text }) => {
        return `<a role="link" target="_blank" href="${href}" rel="nofollow noopener noreferrer">${text}</a>`;
    };

    renderer.blockquote = (quote) => {
        return `<blockquote class="blockquote">${quote}</blockquote>`;
    };

    renderer.table = (table) => {
        let rowsRendered: string[] = [];

        for (const row of table.rows) {
            rowsRendered.push(row.join());
            // const renderedRow = row.join();
            // const cells: string[] = [];

            // for (const cell of row) {

            // }
        }

        return `<table class="table table-striped"><thead>${table.header}</thead><tbody>${rowsRendered.join()}</tbody></table>`;
    };

    return {
        renderer,
        gfm: true,
        breaks: false,
        pedantic: false
    };
}
