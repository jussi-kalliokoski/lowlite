var html = module.exports = function (ast) {
	return ast.map(function (item) {
		return '<span class="' + item.name + '">' +
			html.specials(item.value) + '</span>'
	})
}

html.specials = function (str) {
	return str
		.replace(/\</g, '&lt;')
		.replace(/\>/g, '&gt;')
}
