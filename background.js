chrome.tabs.onUpdated.addListener(function(id, info, tab){
    if (info.status == "complete" && tab.url.toLowerCase().indexOf("magiccards.info") > -1){
        chrome.pageAction.show(tab.id);
        chrome.storage.sync.get('nameAndText', function(response){
			  	if (response !== null){
			  		chrome.tabs.sendMessage(tab.id, {action: 'toggleNameText', toggleValue: response.nameAndText});
			  	}
			  });
        chrome.tabs.sendMessage(tab.id, {action: "checkGET", url: tab.url});
    }
});
