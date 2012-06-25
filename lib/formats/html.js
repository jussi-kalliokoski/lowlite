var html = module.exports = function (ast) {
	return ast.map(function (item) {
		return item.name ? '<span class="' + item.name + '">' +
			html.specials(item.value) + '</span>' :
			html.specials(item.value)
	})
}

html.specials = function (str) {
	return str
		.replace(/\</g, '&lt;')
		.replace(/\>/g, '&gt;')
}
