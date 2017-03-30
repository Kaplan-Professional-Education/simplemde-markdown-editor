
"use strict";

// Note: The following will only render in the CMS, MDReactComponent is used in React
function renderTargets(tokens, idx) {
	var token = tokens[idx];
	var title = token.attrs.filter(function (attr) {
		return attr[0] === "title";
	})[0];

	// Split the title attribute: "Title|Target"
	if (title && title[1].indexOf("|") >= 0) {
		var parts = title[1].split("|");

		title[1] = parts[0];
		token.attrPush(["target", parts[1]]);
	}
}

module.exports = function link_targets_plugin(md) {
	var old_render = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
		return self.renderToken(tokens, idx, options);
	};

	// Replace link_open renderer with title handling wrapper
	md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
		renderTargets(tokens, idx);

		return old_render(tokens, idx, options, env, self);
	};
};
