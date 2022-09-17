module.exports = {
	'*.{ts,js,yml,md,json}': 'prettier -c . --write',
	'**/*.ts?(x)': 'eslint . --fix',
}
