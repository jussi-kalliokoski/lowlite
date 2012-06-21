

var html = module.exports = require('../lexer').create('html', {
	tokens: {
		"CData": function (str, ast) {
			if (this.lastTag !== 'script' && this.lastTag !== 'style') return null

			var after = []
			var len = 0

			do {
				len = str.indexOf('</' + this.lastTag, len)

				if (len === -1) {
					len = str.length
					break
				}
			} while (!html.endTag.test(str.substr(len)))

			var txt = str.substr(0, len)

			/* TODO: Process CData and comment wrappings */
			/* TODO: Process sublanguages */

			this.lastTag = ''

			return txt
		},

		"Comment":  /^\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/,

		"Instruction": /^\<![a-z\d\-_]+(\s+(("([^"\\]|\\.)*")|('([^'\\]|\\.)*')|([a-z\d\-_]+)))*\s*\>/i,

		"SpecialCharacter": /^&((#\d+)|[a-z]+);/i,

		"EndTag": function (str, ast) {
			if (str.indexOf('</')) return null

			var m = html.endTag.exec(str)

			if (!m) return null

			ast.pushLater({
				name: 'EndTag',
				value: '</'
			}, {
				name: 'TagName',
				value: m[1]
			}, {
				name: 'EndTag',
				value: m[2]
			})

			return m[0].length
		},

		"StartTag": function (str, ast) {
			if (str[0] !== '<') return null

			var m = html.startTag.exec(str)

			if (!m) return null

			ast.pushLater({
				name: 'StartTag',
				value: '</'
			}, {
				name: 'TagName',
				value: m[1]
			})

			var attrs = m[2]

			while (attrs) {
				var mx = html.attribute.exec(attrs)

				if (!mx) {
					ast.pushLater({
						name: 'StartTag',
						value: attrs
					})

					break
				}

				if (mx[1]) ast.pushLater({
					name: 'Whitespace',
					value: mx[1]
				})

				ast.pushLater({
					name: 'AttributeName',
					value: mx[2]
				})

				if (mx[3]) ast.pushLater({
					name: 'Operator',
					value: '='
				}, {
					name: 'AttributeValue',
					value: mx[4]
				})

				if (mx[10]) ast.pushLater({
					name: 'Whitespace',
					value: mx[10]
				})

				attrs = attrs.substr(mx[0].length)
			}

			ast.pushLater({
				name: 'StartTag',
				value: m[3]
			})

			this.lastTag = m[1]

			return m[0].length
		}
	},

	attribute: /^(\s*)([-a-z\d_]+)(=(("([^"\\]|\\.)*")|('([^'\\]|\\.)*')|([^\s]+)))?(\s*)/i,

	endTag: /^<\/([-a-z\d_]+)([^>]*>)/i,

	startTag: /^<([-a-z\d_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)(\s*\/?>)/i,
}, {
	unknownName: 'text',

	lastTag: '',

	onbeforeparse: function () {
		this.lastTag = ''
	},

	onunprocessed: function (str, ast) {
		var m = str.trimLeft()
		var l = str.length - m.length

		var start = str.substr(0, l)

		var middle = m.trimRight()

		l += middle.length

		var end = str.substr(l)

		if (!middle) {
			ast.push({
				name: 'Whitespace',
				value: start + end
			})
		} else {
			if (start) ast.push({
				name: 'Whitespace',
				value: start
			})

			if (middle) ast.push({
				name: this.unknownName,
				value: middle
			})

			if (end) ast.push({
				name: 'Whitespace',
				value: end
			})
		}
	}
})
