module.exports = {
	Lexer: require('./lexer'),

	"javascript": require('./languages/javascript'),
	"css": require('./languages/css'),
	'html': require('./languages/html')
}

module.exports.js = module.exports.javascript
