function toggleNameText(e){
	var toggleValue = this.checked
  chrome.storage.sync.set({'nameAndText': toggleValue}, function(){
  	chrome.tabs.getSelected(null, function(tab){
  		chrome.tabs.sendMessage(tab.id, {action: 'toggleNameText', toggleValue: toggleValue});
  	});
  });
}

function fillq(e){
	var query = this.id;

	chrome.tabs.getSelected(null, function(tab){
		chrome.tabs.sendMessage(tab.id, {action: 'fillQ', query: query}, {}, function(response){
			if (response.text == 'success'){
				window.close();
			}
		});
	});
}

function toggleDiv(e){
	document.getElementsByClassName(this.id)[0].classList.toggle('hidden');
}

document.addEventListener('DOMContentLoaded', function(){
	var nameTextOn = document.getElementById('nameAndText');
	chrome.storage.sync.get('nameAndText', function(response){
		if (response !== null){
			console.log(response.nameAndText);
			nameTextOn.checked = response.nameAndText;
		}
	});
	nameTextOn.addEventListener('change', toggleNameText, true);

	var categories = document.getElementsByClassName('category');
	var len = categories.length;
	for (var i = 0; i < len; i++){
		categories[i].addEventListener('click', toggleDiv, true);
	}

	var examples = document.getElementsByClassName('example');
	var len = examples.length;
	for (var i = 0; i < len; i++){
		examples[i].addEventListener('click', fillq, true);
	}
});