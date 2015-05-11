function fillq(e){
	var query = '';
	switch(this.id){
		case 'cNumeric':
			query = 'c:3wu';
			break;
		case 'ciStrict':
			query = 'ci!wu -c:wum';
			break;
		case 'cwLoose' :
			query = 'cw:gw';
			break;
		case 'cwStrict':
			query = 'cw!g';
			break;
		default:
			break;
	};

	chrome.tabs.getSelected(null, function(tab){
		chrome.tabs.sendMessage(tab.id, {action: 'fillQ', query: query});
	});
}

document.addEventListener('DOMContentLoaded', function(){
	var links = document.getElementsByClassName('link');
	var len = links.length;
	for (var i = 0; i < len; i++){
		links[i].addEventListener('click', fillq, true);
	}
});