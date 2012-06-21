function defineValue (obj, name, value) {
	Object.defineProperty(obj, name, {
		value: value,
		writable: true,
		configurable: true,
		enumerable: false
	})
}

function sortCopy (arr) {
	return arr.slice().sort(function (a, b) {
		return	a.length > b.length ? 1 :
			a.length < b.length ? -1 : 0
	})
}

function Lexer () {
	defineValue(this, "tokens", Object.keys(this.constructor.tokens)
		.map(Lexer.createToken
			.bind(Lexer, this.constructor.tokens)))
}

Lexer.prototype = {
	tokens: null,
	unknownName: 'UNKNOWN',

	parse: function (str) {
		if (this.onbeforeparse) this.onbeforeparse(str)

		var left, i, s, list, unparsed

		left = str
		list = Lexer.createList(this.constructor.name)
		unparsed = ''

		parsing: while (left) {
			for (i=0; i<this.tokens.length; i++) {
				s = this.tokens[i].test.call(this, left, list)

				if (s) {
					if (unparsed) {

						if (this.onunprocessed) {
							this.onunprocessed(unparsed, list)
						} else {
							list.push({
								name: this.unknownName,
								value: unparsed
							})
						}

						unparsed = ''
					}


					switch (typeof s) {
					case "string":
						list.push({
							name: this.tokens[i].name,
							value: s
						})

						left = left.substr(s.length)
						break
					case "number":
						list.pushNow()

						left = left.substr(s)
						break
					default:
						throw Error("Fatal lexer failure: invalid return value")
					}

					continue parsing
				}
			}

			unparsed += left[0]
			left = left.substr(1)
		}

		if (this.onafterparse) this.onafterparse(list)

		return list
	}
}

Lexer.createList = function (type) {
	var l = []

	Object.keys(Lexer.createList.prototype).forEach(function (key) {
		defineValue(l, key, Lexer.createList.prototype[key])
	})

	defineValue(l, 'later', [])
	defineValue(l, 'type', type)

	return l
}

Lexer.createList.prototype = {
	pushLater: function () {
		return this.later.push.apply(this.later, arguments)
	},

	pushNow: function () {
		return this.push.apply(this,
			this.later.splice(0, this.later.length))
	}
}


Lexer.create = function (name, statics, proto) {
	var func = Function(
	'var s = arguments[0];' +
	'return function ' + name + ' () {' +
		'var p = Object.create(' + name + '.prototype);' +
		's.apply(p, arguments);' +
		'if (p.init) p.init.apply(p, arguments);' +
		'return p;' +
	'}')(Lexer);

	func.prototype = Object.create(Lexer.prototype)
	func.prototype.constructor = func

	if (statics) {
		Object.keys(statics).forEach(function (key) {
			defineValue(func, key, statics[key])
		})
	}

	if (proto) {
		Object.keys(proto).forEach(function (key) {
			func.prototype[key] = proto[key]
		})
	}

	return func
}

Lexer.createToken = function (tokens, name) {
	var match = tokens[name]

	if (Array.isArray(match)) {
		match = sortCopy(match)

		return { test: function (str) {
			for (var i=0; i<match.length; i++) {
				if (str.substr(0, match[i].length) === match[i]) {
					return match[i]
				}
			}

			return null
		}, name: name }
	}

	if (match instanceof RegExp) {
		return { test: function (str) {
			var m = match.exec(str)

			return m && m[0]
		}, name: name }
	}

	if (match instanceof Function) {
		return {
			test: match,
			name: name
		}
	}

	if (match instanceof Object) {
		var inherits = Lexer.createToken(tokens, match.inherits).test
		match = match.test

		if (Array.isArray(match)) {
			var l = sortCopy(match)
			match = function (str) {
				if (l.indexOf(str) !== -1) return str

				return null
			}
		} else {
			match = Lexer.createToken({a: match}, 'a').test
		}

		return { test: function (str) {
			var r = inherits(str)

			if (!r) return r

			return match(r)
		}, name: name }
	}

	throw TypeError("Invalid type for token creation");
}

module.exports = Lexer
