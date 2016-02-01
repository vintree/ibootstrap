var $ = function() {};

$.find = function(node, query) {
	console.log(node);
	console.log(query);
	console.log(node.childNodes);
	const childList = node.childNodes;
	const len = childList;

	console.log('---');
			console.log(this);


	
	for(let i = 0; i < len; i++) {
		if(childList[i].nodeName === '#text' && !/\s/.test(elem_child.nodeValue)) {

		} else {

		}
	}

}

$.parent = function(e) {

}

$.parents = function() {

}

module.exports = $;