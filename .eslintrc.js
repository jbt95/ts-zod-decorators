module.exports = {
	ignorePatterns: ['dist'],
	'env': {
		'es2021': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier'
	],
	'overrides': [
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module'
	},
	'plugins': [
		'@typescript-eslint'
	],
	'rules': {
		'indent': 'off',
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/semi': 'error',
		'@typescript-eslint/indent': 'off',
		'@typescript-eslint/no-empty-function': 'error',
		'@typescript-eslint/no-empty-interface': 'error',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-misused-new': 'error',
		'@typescript-eslint/no-namespace': 'error',
		'@typescript-eslint/no-parameter-properties': 'off',
		'@typescript-eslint/no-unused-expressions': 'error',
		'@typescript-eslint/restrict-template-expressions': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-var-requires': 'error',
		'@typescript-eslint/prefer-for-of': 'error',
		'@typescript-eslint/prefer-function-type': 'error',
		'@typescript-eslint/prefer-namespace-keyword': 'error',
		'@typescript-eslint/quotes': 'off',
		'@typescript-eslint/no-for-in-array': 'error',
		'@typescript-eslint/no-require-imports': 'error',
		'@typescript-eslint/no-unnecessary-condition': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/default-param-last': 'error',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/no-useless-constructor': 'off',
		'@typescript-eslint/no-misused-promises': 'off',
		'@typescript-eslint/ban-tslint-comment': 'error',
		'@typescript-eslint/consistent-type-assertions': 'error',
		'@typescript-eslint/member-delimiter-style': [
			'off',
			{
				multiline: {
					delimiter: 'none',
					requireLast: true,
				},
				singleline: {
					delimiter: 'semi',
					requireLast: false,
				},
			},
		],
		'@typescript-eslint/array-type': [
			'error',
			{
				default: 'array',
			},
		],
		'@typescript-eslint/ban-types': [
			'error',
			{
				types: {
					Object: {
						message: 'Avoid using the `Object` type. Did you mean `object`?',
					},
					Function: {
						message:
							'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
					},
					Boolean: {
						message: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
					},
					Number: {
						message: 'Avoid using the `Number` type. Did you mean `number`?',
					},
					String: {
						message: 'Avoid using the `String` type. Did you mean `string`?',
					},
					Symbol: {
						message: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
					},
				},
			},
		],
	}
};
