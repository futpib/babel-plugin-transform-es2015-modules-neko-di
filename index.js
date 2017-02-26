module.exports = function () {
	return {
		inherits: require('babel-plugin-transform-es2015-modules-amd'),
		pre() {
			if (!this.getModuleName()) {
				throw new Error('`moduleId` is required');
			}
		}
	};
};
