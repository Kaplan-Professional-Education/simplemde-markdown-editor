
"use strict";

function icons_inline(iconSets) {
	var iconSetsRegex = iconSets.join("|");
	var ICON_TAG_RE = new RegExp(":(" + iconSetsRegex + ")-[\\w\\-]+:", "i");

	return function (state, silent) {
		var match, token, end, icon, iconSet,
			pos = state.pos,
			max = state.posMax;

		// Check start
		if (state.src.charCodeAt(pos) !== 0x3A /* : */ ||
				pos + 5 >= max) {
			return false;
		}

		match = state.src.slice(pos).match(ICON_TAG_RE);
		if (!match) { return false; }

		end = match[0].length;
		icon = match[0].slice(1, match[0].length - 1);
		iconSet = match[1];

		if (!silent) {
			token         = state.push("icon_inline", "i", 0);
			token.markup  = state.src.slice(pos, pos + end);
			token.attrPush(["className", iconSet + " " + icon]);
		}

		state.pos += end;
		return true;
	};
}

// Note: The following will only render in the CMS, MDReactComponent is used in React
function renderIcon(tokens, idx) {
	var token = tokens[idx];
	var className = token.attrs.filter(function (attr) {
		return attr[0] === "className";
	})[0];

	return "<i class='" + className[1] + "'></i>";
}

module.exports = function icon_plugin(iconSets) {
	var ii = icons_inline(iconSets);

	return function (md) {
		md.inline.ruler.push("icon_inline", ii);

		md.renderer.rules["icon_inline"] = renderIcon;
	};
};
