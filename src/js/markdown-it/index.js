module.exports = {
	Renderer: require("markdown-it"),
	Plugins: [
		require("./plugin/inline-text-color"),
		require("./plugin/block-align"),
		require("./plugin/inline-jsx"),
		require("./plugin/inline-icons")(["fa", "kf"]),
		require("./plugin/inline-link-targets"),
	],
};
