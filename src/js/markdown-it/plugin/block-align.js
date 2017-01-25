
"use strict";

function getAlignment(src) {
	switch (src) {
	case "[<-]":
		return "left";
	case "[->]":
		return "right";
	case "[><]":
		return "center";
	case "[<>]":
		return "justify";
	default:
		return undefined;
	}
}

function alignment(state, startLine, endLine, silent) {
	var src, dir, token,
		pos = state.bMarks[startLine] + state.tShift[startLine],
		max = state.eMarks[startLine];

	if (silent) { return true; }

	// Check for '['
	if (state.src.charCodeAt(pos) !== 0x5B || pos + 4 >= max) { return false; }

	src = state.src.slice(pos, 4);
	dir = getAlignment(src);

	if (!dir) { return false; }

	state.line = startLine + 1;
	state.bMarks[startLine] = state.bMarks[startLine] + 4;

	token          = state.push("alignment_open", "div", 1);
	token.markup   = src;
	token.map      = [ startLine, state.line ];
	token.attrPush(["style", "text-align:" + dir]);

	state.md.block.tokenize(state, startLine, startLine + 1);

	token          = state.push("alignment_close", "div", -1);

	return true;
}

module.exports = function sub_plugin(md) {
	md.block.ruler.before("heading", "alignment", alignment);
};
