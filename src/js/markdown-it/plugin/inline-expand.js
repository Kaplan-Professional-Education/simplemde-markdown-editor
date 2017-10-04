// Process ~subscript~

"use strict";

var EXPAND_OPEN_REGEX = /\[\s*?\+\s*?"([\w?\W?]+?)"\s*?-\s*?"([\w?\W?]+?)"\s*?\]/;
var EXPAND_CLOSE_REGEX = /\[\s*?\+\s*?-\s*?\]/;
var TOKEN_TYPE = "expand_collapse";
var MARKUP = "{expand}";

function expand_collapse(state, silent) {
	var content,
		token,
		startResult,
		endResult,
		result,
		max = state.posMax,
		start = state.pos;

	if (state.src.charCodeAt(start) !== 0x5B/* ~ */) { return false; }
	if (silent) { return false; } // don't run any pairs in validation mode

	content = state.src.slice(start);
	startResult = EXPAND_OPEN_REGEX.exec(content);
	endResult = EXPAND_CLOSE_REGEX.exec(content);

	if(!startResult && !endResult) { return false; }

	if(startResult && endResult) {
		if(startResult.index < endResult.index) {
			result = startResult;
		} else {
			result = endResult;
		}
	} else if(startResult) {
		result = startResult;
	} else {
		result = endResult;
	}

	state.posMax = start + result[0].length;

	token = state.push(TOKEN_TYPE, "Collapsible", 0);
	token.markup = MARKUP;
	token.tag = "Collapsible";
	token.props = {};

	token.props.expandTitle = result[1];
	token.props.collapseTitle = result[2];
	token.props.collapsed = true;
	token.props.onlyText = true;
	token.props.children = endResult && startResult && content.slice(startResult[0].length, endResult.index);
    
	state.src = state.src.replace(new RegExp(token.props.children), "");
	state.pos = state.posMax;
	state.posMax = max;
	return true;
}

function renderJSX(tokens, idx) {
	var token = tokens[idx];

	// Note: The following will only render in the CMS - MDReactComponent will replace with the actual component
	return "<span style='border: 1px dashed #ccc; background-color: #FFFFCE; display: inline-block; margin: 5px; padding: 5px'>"
		+ token.tag + " Component"
		+ "</span>";
}

module.exports = function expand_plugin(md, name, options) {
	options = options || {};

	md.inline.ruler.before("html_inline", "expand_collapse", expand_collapse);

	md.renderer.rules[TOKEN_TYPE] = options.render || renderJSX;
};
