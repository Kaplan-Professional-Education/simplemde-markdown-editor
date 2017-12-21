// Process DynamicContent ModalLinkA
// Based on https://github.com/markdown-it/markdown-it/blob/master/lib/rules_inline/html_inline.js

"use strict";

var DYNAMIC_OPEN_REGEX = /~!~((?:(?!~!~).)+)/;
var DYNAMIC_CLOSE_REGEX = /(}\~\!\~){1}/;
var TOKEN_TYPE = "dynamic_content";
var MARKUP = "{dynamic_content}";

function dynamic_content(state, silent) {
    var content,
        token,
        startResult,
        endResult,
        result,
        nextPos,
        max = state.posMax,
        start = state.pos;

    if (state.src.charCodeAt(start) !== 0x7E/* ~ */) { return false; }
    if (silent) { return false; } // don't run any pairs in validation mode
    
    content = state.src.slice(start);
    startResult = DYNAMIC_OPEN_REGEX.exec(content);
    endResult = DYNAMIC_CLOSE_REGEX.exec(content);
    if(!startResult && !endResult) { return false; }
    if(startResult && endResult) {
        if(startResult.index < endResult.index) {
            result = startResult[1];
        } else {
            result = endResult;
        }
        nextPos = endResult.index + 4;
    } else if(startResult) {
        result = startResult[1];
        nextPos = startResult[0].length;
    } else {
        result = endResult;
        nextPos = endResult.index + 4;
    }

    state.posMax = start + nextPos;  
    token = state.push(TOKEN_TYPE, "DynamicContentA", 0);
    token.markup = MARKUP;
    token.tag = "DynamicContentA";
    token.props = {};
    token.props.content = result;
    
    state.src = state.src.replace(new RegExp(content), "");
    state.pos = state.posMax;
    state.posMax = max;
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

module.exports = function jsx_plugin(md) {
    md.inline.ruler.before("html_inline", "dynamic_content", dynamic_content);  
    md.renderer.rules["dynamic_content"] = renderDynamicContent;
};
