/*
TODO: Add URLs.
*/
module.exports = require('../lexer').create('css', {
	tokens: {
		"Instruction": /^@[a-z_\-]+/i,

		"Variable": /^\$[a-z_\-]+/i,

		"Keyword": { "test": [
			'inherit', 'initial'
		], "inherits": 'Identifier' },

		"Unit": { "test": [
			'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin',
			'cm', 'mm', 'in', 'px', 'pt', 'pc',
			'deg', 'grad', 'rad', 'turn',
			's', 'ms',
			'Hz', 'kHz',
			'dpi', 'dpcm', 'dppx',
			'%'
		], "inherits": 'Identifier' },

		"Identifier": /^[a-z_\-]+/i,

		"HexColor": /^#(([\da-f]{6})|([\da-f]{3}))/i,

		"String": /^(("([^"\\]|\\.)*")|('([^'\\]|\\.)*'))/,

		"Comment": /^((\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/[^\n\r]+))/,

		"Number": /^((0x[\da-f]+)|(0[0-7]+)|((0|([1-9]\d*))e(\+|-)?\d+)|(0?\.\d+)|([1-9]\d*(\.\d+)?)|0)/i,

		"Whitespace": /^[\n\t\r ]+/,

		"Operator": [
			'::', '~=', '^=', '$=', '*=', '|=',
			':', '.', '~', '#', '>',
			'(', ')', ';', ',',
			'=', '+', '-', '*', '/'
		],

		"Bracket": [
			'{', '}', '[', ']'
		]
	}
})
