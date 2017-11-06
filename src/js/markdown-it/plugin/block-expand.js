// Process ~subscript~

"use strict";

var EXPAND_OPEN_REGEX = /\[\s*?\+\s*?"([\w?\W?]+?)"\s*?-\s*?"([\w?\W?]+?)"\s*?\]/;
var EXPAND_CLOSE_REGEX = /\[\s*?\+\s*?-\s*?\]/;
var TOKEN_TYPE = "expand_collapse";
var MARKUP = "{expand}";

function expand_collapse(state, startLine, endLine, silent) {
	var content,
		token,
		startResult,
		endResult,
		nextLine,
		contentLines = {
			children: [],
			onlyText: true,
			collapsed: true,
		},
		max = state.eMarks[startLine],
		start = state.bMarks[startLine] + state.tShift[startLine];

	if (!EXPAND_OPEN_REGEX.exec(state.src)/* [+"View More" -"View Less"] */) { return false; }
	if (silent) { return false; } // don't run any pairs in validation mode

	// We need to iterate over block lines
	nextLine = startLine ;
	
	for (;;) {
		if (nextLine >= endLine) {
			break;
		}
		start = state.bMarks[nextLine] + state.tShift[nextLine];
		max = state.eMarks[nextLine];
		content = state.src.slice(start, max);
		startResult = EXPAND_OPEN_REGEX.exec(content);
		endResult = EXPAND_CLOSE_REGEX.exec(content);

		if (startResult) { // We got a line with the opening tag
			contentLines.expandTitle = startResult[1];
			contentLines.collapseTitle = startResult[2];
			if (endResult) { // Since this line has opening AND closing tags, it's a inline use
				contentLines.children.push(content.slice(startResult[0].length, content.length - 4));
				break;
			} else { // just openening, we should have a closing tag on future lines
				contentLines.children.push(content.slice(startResult[0].length));
			}
		} else if (endResult) { // Current line is the last one, i.e, the one with [+-]
			contentLines.children.push(content.slice(0, endResult.index));
			break;
		} else { // Current line is only content, no opening nor closing tags here
			contentLines.children.push(content);
		}
		nextLine++;
	}
	
	token = state.push(TOKEN_TYPE, "Collapsible", 0);
	token.markup = MARKUP;
	token.tag = "Collapsible";
	token.block = true;
	token.props = contentLines;

	state.line = nextLine + 1;
	return true;
}

function renderJSX(md) {
	return function (tokens, idx) {
		var token = tokens[idx];

		// Note: The following will only render in the CMS - MDReactComponent will replace with the actual component
		return "<span style='display: inline-block; margin: 5px; padding: 5px'>"
			+ "<a class='smde-collapse-toggle'>"
			+ token.props.expandTitle
			+ " / "
			+ token.props.collapseTitle
			+ "</a>"
			+ "<br /><span style='border: 1px dashed #ccc; display: inline-block; margin: 5px; padding: 5px' class='smde-collapse-body'>"
			+ token.props.children.map(function(item){
				return md.render(item);
			}).join("\n")
			+ "</span>"
			+ "</span>";
	};
}

module.exports = function expand_plugin(md, name, options) {
	options = options || {};

	md.block.ruler.before("html_block", "expand_collapse", expand_collapse);

	md.renderer.rules[TOKEN_TYPE] = options.render || renderJSX(md);
};
