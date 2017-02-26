
const test = require('ava');

const babel = require('babel-core');

test('works', t => {
	const actual = babel.transform(`
		import defaultMember from "module-name";
		export default 42;
	`, {
		plugins: ['.'],
		moduleId: 'module-id'
	}).code;
	t.snapshot(actual); // eslint-disable-line ava/use-t-well
});
