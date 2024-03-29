var formats = require('./formats')
var lexers = require('./lexers')

function extend (obj) {
	var k, i

	for (i=1; i<arguments.length; i++) {
		for (k in arguments[i]) {
			if (arguments[i].hasOwnProperty(k)) {
				obj[k] = arguments[i][k]
			}
		}
	}

	return obj
}

function Highlighter (options) {
	options = extend(this, options || {})

	this._lexer = lexers[this.lexer] && lexers[this.lexer]()
}

Highlighter.prototype = {
	_lexer: null,
	aliases: null,

	lexer: 'javascript',
	format: 'html',

	highlight: function (code) {
		if (!this._lexer) return code

		var format = formats[this.format]

		if (!format) throw TypeError('Unsupported format ' + this.format)

		var ast = this._lexer.parse(code)

		if (this.aliases) {
			var map = this.aliases
			var keys = Object.keys(map)
			var aliases = keys.map(function (key) {
				return map[key]
			})

			ast.forEach(function (item) {
				var i = keys.indexOf(item.name)

				if (i === -1) return

				item.name = aliases[i]
			})
		}

		return format(ast).join('')
	}
}

module.exports = {
	Highlighter: Highlighter,
	formats: formats,
	lexers: lexers,

	shorthands: {
		"KeyWord": "kw",
		"Identifier": "in",
		"RegExp": "re",
		"String": "st",
		"Comment": "cm",
		"Whitespace": "",
		"Operator": "op",
		"Bracket": "br",
		"Instruction": "is",
		"Variable": "vr",
		"Unit": "un",
		"HexColor": "hx",
		"UniqueID": "id",
		"ClassName": "cn",
		"CData": "cd",
		"SpecialCharacter": "sc",
		"StartTag": "sg",
		"EndTag": "eg",
		"TagName": "tn",
		"AttributeValue": "av",
		"AttributeName": "an"
	},

	highlight: function (code, options) {
		var hl = new Highlighter(options)

		return hl.highlight(code)
	}
}
