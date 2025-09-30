// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Parser, Tokens } from "marked";
import { MarkedOptions, MarkedRenderer } from "ngx-markdown";

export function markedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();

    renderer.image = ({ href, title, text }) => {
        return `<div class="text-center"><img class="img-fluid rounded" src=${href} alt="${text}" /></div>`;
    };

    renderer.link = ({ href, title, text }) => {
        return `<a role="link" target="_blank" href="${href}" rel="nofollow noopener noreferrer">${text}</a>`;
    };

    renderer.blockquote = ({ tokens }) => {
        return '<blockquote class="blockquote"><p>' + Parser.parse(tokens) + '</p></blockquote>';
    };

    renderer.table = (tableTokens: Tokens.Table) => {
        // Build header row
        const headerRendered = tableTokens.header.map((cell, i) => {
            const align = tableTokens.align[i];
            const style = align ? ` style="text-align:${align}"` : '';
            return `<th${style}>${cell.text}</th>`;
        }).join('');

        // Build body rows
        const bodyRendered = tableTokens.rows.map(row => {
            const cells = row.map((cell, j) => {
                const align = tableTokens.align[j];
                const style = align ? ` style="text-align:${align}"` : '';
                return `<td${style}>${cell.text}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `<table class="table table-striped"><thead>${headerRendered}</thead><tbody>${bodyRendered}</tbody></table>`;
    };

    return {
        renderer,
        gfm: true,
        breaks: false,
        pedantic: false
    };
}
