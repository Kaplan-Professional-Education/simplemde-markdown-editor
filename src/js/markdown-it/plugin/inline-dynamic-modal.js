// Process DynamicContent ModalLinkA
// Based on https://github.com/markdown-it/markdown-it/blob/master/lib/rules_inline/html_inline.js

"use strict";

var DYNAMIC_REGEX = /~!~((?:(?!~!~).)+)~!~/;
var TOKEN_TYPE = "dynamic_content";

function dynamic_content(state, silent) {
    var match, token, end, pos = state.pos;

    match = state.src.slice(pos).match(DYNAMIC_REGEX);
    if (!match) { return false; }

    end = match[0].length;

    if (!silent) {
        token = state.push(TOKEN_TYPE, "DynamicContentA", 0);
        token.props = {};
        token.props.content = match[1];
        token.props.rawText = match[0];
    }
    state.pos += end;
    return true;
}

function renderDynamicContent(tokens, idx) {
    var token = tokens[idx];
    try {
        token.props.content = JSON.parse(token.props.content);
    } catch (error) {
        return token.props.content;
    }
    // Note: The following will only render in the CMS
    return "<span style='display: inline-block;'>"
        + "<a class='smde-dynamic' style='color: #0098cd; text-decoration: none;'>"
        + token.props.content.title
        + "</a>"
        + "</span>";
}

module.exports = function dynamic_content_plugin(md) {
    md.inline.ruler.before("html_inline", "dynamic_content", dynamic_content);
    md.renderer.rules["dynamic_content"] = renderDynamicContent;
};
