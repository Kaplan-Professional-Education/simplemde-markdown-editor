module.exports = {
	Renderer: require("markdown-it"),
	Plugins: [
		require("markdown-it-sup"),
		require("./plugin/inline-text-color"),
		require("./plugin/block-align"),
		require("./plugin/inline-jsx"),
		require("./plugin/inline-icons")(["fa", "kf"]),
		require("./plugin/inline-link-targets"),
		require("./plugin/inline-expand"),
	],
};
