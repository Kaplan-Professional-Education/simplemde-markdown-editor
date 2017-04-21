// Process JSX tags to be converted into React components
// Based on https://github.com/markdown-it/markdown-it/blob/master/lib/rules_inline/html_inline.js

"use strict";


var unquoted      = "([^\"'=<>`\\x00-\\x20]+)";
var single_quoted = "'(?:[^'\\]|\\.)*'";
var double_quoted = '"(?:[^"\\]|\\.)*"';  // eslint-disable-line quotes

var attr_name     = "([a-zA-Z_:][a-zA-Z0-9:._-]*)";
var attr_value    = "(?:" + unquoted + "|" + single_quoted + "|" + double_quoted + ")";
var attribute     = "\\s+" + attr_name + "\\s*=\\s*" + attr_value;

var tag_name      = "([A-Za-z][A-Za-z0-9\\-]*)";

var JSX_TAG_RE    = new RegExp("<" + tag_name + "(" + attribute + ")*\\s*\\/>");


function jsx_inline(state, silent) {
	var match, token, tag, end, attributes, atr,
		pos = state.pos,
		max = state.posMax;

	// Check start
	if (state.src.charCodeAt(pos) !== 0x3C /* < */ ||
			pos + 2 >= max) {
		return false;
	}

	match = state.src.slice(pos).match(JSX_TAG_RE);
	if (!match) { return false; }

	end = match[0].length;
	tag = match[1];

	if (!silent) {
		token         = state.push("jsx_inline", tag, 0);
		token.markup  = state.src.slice(pos, pos + end);

		token.props = {};
		attributes = new RegExp(attribute, "g");
		while (atr = attributes.exec(match[0])) {  // eslint-disable-line no-cond-assign
			token.props[atr[1]] = atr[2] || atr[3] || atr[4];
		}
	}

	state.pos += end;
	return true;
}

function renderJSX(tokens, idx) {
	var token = tokens[idx];

	// Note: The following will only render in the CMS - MDReactComponent will replace with the actual component
	return "<span style='border: 1px dashed #ccc; background-color: #FFFFCE; display: inline-block; margin: 5px; padding: 5px'>"
		+ token.tag + " Component"
		+ "</span>";
}

module.exports = function jsx_plugin(md) {
	md.inline.ruler.before("html_inline", "span", jsx_inline);

	md.renderer.rules["jsx_inline"] = renderJSX;
};
