//https://github.com/developit/snarkdown/blob/master/src/index.js

const TAGS = {
    '|' : ['<em>','</em>'],
    _ : ['<strong>','</strong>'],
    '~' : ['<s>','</s>'],
    '\n' : ['<br />'],
    ' ' : ['<br />'],
    '-': ['<hr />']
};

/** Outdent a string based on the first indented line's leading whitespace
 *	@private
 */
function outdent(str) {
    return str.replace(RegExp('^'+(str.match(/^(\t| )+/) || '')[0], 'gm'), '');
}

/** Encode special attribute characters to HTML entities in a String.
 *	@private
 */
function encodeAttr(str) {
    return (str+'').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseLinks(text) {
    return (text || "").replace(
        /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
        function(match, space, url){
            var hyperlink = url;
            if (!hyperlink.match('^https?:\/\/')) {
                hyperlink = 'http://' + hyperlink;
            }
            return space + '<a href="' + hyperlink + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
        }
    );
}

/** Parse Markdown into an HTML String. */
function parseInternal(md, prevLinks) {
    let tokenizer = /((?:^|\n+)(?:\n---+|\* \*(?: \*)+)\n)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)|((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|((?:(?:^|\n)([>*+-]|\d+\.)\s+.*)+)|(?:\!\[([^\]]*?)\]\(([^\)]+?)\))|(\[)|(\](?:\(([^\)]+?)\))?)|(?:(?:^|\n+)([^\s].*)\n(\-{3,}|={3,})(?:\n+|$))|(?:(?:^|\n+)(#{1,6})\s*(.+)(?:\n+|$))|(?:`([^`].*?)`)|(  \n\n*|\n{2,}|\|\||\*\*|[|*]|~~)/gm,
        context = [],
        out = '',
        links = prevLinks || {},
        last = 0,
        chunk, prev, token, inner, t;

    function tag(token) {
        var desc = TAGS[token.replace(/\*/g,'_')[1] || '|'],
            end = context[context.length-1]==token;
        if (!desc) return token;
        if (!desc[1]) return desc[0];
        context[end?'pop':'push'](token);
        return desc[end|0];
    }

    function flush() {
        let str = '';
        while (context.length) str += tag(context[context.length-1]);
        return str;
    }

    md = md.replace(/^\[(.+?)\]:\s*(.+)$/gm, (s, name, url) => {
        links[name.toLowerCase()] = url;
        return '';
    }).replace(/^\n+|\n+$/g, '').replace(/(\r\n|\n|\r)/gm, "<br>");

    while ( (token=tokenizer.exec(md)) ) {
        prev = md.substring(last, token.index);
        last = tokenizer.lastIndex;
        chunk = token[0];
        if (prev.match(/[^\\](\\\\)*\\$/)) {
            // escaped
        }
        // Code/Indent blocks:
        else if (token[3] || token[4]) {
            chunk = '<pre class="code '+(token[4]?'poetry':token[2].toLowerCase())+'">'+outdent(encodeAttr(token[3] || token[4]).replace(/^\n+|\n+$/g, ''))+'</pre>';
        }
        // > Quotes, -* lists:
        else if (token[6]) {
            t = token[6];
            if (t.match(/\./)) {
                token[5] = token[5].replace(/^\d+/gm, '');
            }
            inner = parseInternal(outdent(token[5].replace(/^\s*[>*+.-]/gm, '')));
            if (t==='>') t = 'blockquote';
            else {
                t = t.match(/\./) ? 'ol' : 'ul';
                inner = inner.replace(/^(.*)(\n|$)/gm, '<li>$1</li>');
            }
            chunk = '<'+t+'>' + inner + '</'+t+'>';
        }
        // Images:
        else if (token[8]) {
            chunk = `<img src="${encodeAttr(token[8])}" alt="${encodeAttr(token[7])}" class="img-fluid">`;
        }
        // Links:
        else if (token[10]) {
            let aHref = encodeAttr(token[11] || links[prev.toLowerCase()]);
            if(aHref !== "undefined") {
                out = out.replace('<a class="pre-href">', `<a href="${aHref}" target="_blank" rel="noopener noreferrer">`);
                chunk = flush() + '</a>';
            } else {
                out = out.replace('<a class="pre-href">', `[`);
                chunk = flush() + ']';
            }
        }
        else if (token[9]) {
            chunk = '<a class="pre-href">';
        }
        // Headings:
        else if (token[12] || token[14]) {
            t = 'h' + (token[14] ? token[14].length : (token[13][0]==='='?1:2));
            chunk = '<'+t+'>' + parseInternal(token[12] || token[15], links) + '</'+t+'>';
        }
        // `code`:
        else if (token[16]) {
            chunk = '<code>'+encodeAttr(token[16])+'</code>';
        }
        // Inline formatting: *em*, **strong** & friends
        else if (token[17] || token[1]) {
            chunk = tag(token[17] || '--');
        }
        out += prev;
        out += chunk;
    }

    return (out + md.substring(last) + flush()).trim();
}

export default function parse(md, prevLinks) {
    return parseLinks(parseInternal(md, prevLinks));
}