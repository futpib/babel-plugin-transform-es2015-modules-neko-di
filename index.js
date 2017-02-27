
const template = require('babel-template');

const defineTemplate = template(`
	di.define(MODULE_NAME, [SOURCES], function (PARAMS) {
		const module = { exports: {} };
		const exports = module.exports;

		BODY;

		return module.exports;
	});
`);

module.exports = function (babel) {
	const {types: t} = babel;

	function isRequireCall(path) {
		if (!path.isCallExpression()) {
			return false;
		}
		if (!path.get('callee').isIdentifier({name: 'require'})) {
			return false;
		}
		if (path.scope.getBinding('require')) {
			return false;
		}

		return true;
	}

	const nekoVisitor = {
		VariableDeclarator(path) {
			const id = path.get('id');
			if (!id.isIdentifier()) {
				return;
			}

			const init = path.get('init');
			if (!isRequireCall(init)) {
				return;
			}

			const source = init.node.arguments[0];
			this.sources.push([id.node, source]);

			path.remove();
		}
	};

	return {
		inherits: require('babel-plugin-transform-es2015-modules-commonjs'),

		pre() {
			this.sources = [];

			this.moduleName = this.getModuleName();

			if (!this.moduleName) {
				throw new Error('`moduleName` is required (check babel `moduleId` options)');
			}
		},

		visitor: {
			Program: {
				exit(path) {
					if (this.ran) {
						return;
					}
					this.ran = true;

					path.traverse(nekoVisitor, this);

					const params = this.sources.map(source => source[0]);
					const sources = this.sources.map(source => source[1]);

					const moduleName = t.stringLiteral(this.moduleName);

					path.node.body = [defineTemplate({
						MODULE_NAME: moduleName,
						SOURCES: sources,
						PARAMS: params,
						BODY: path.node.body
					})];
				}
			}
		}
	};
};
