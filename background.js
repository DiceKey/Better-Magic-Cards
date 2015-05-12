chrome.tabs.onUpdated.addListener(function(id, info, tab){
    if (info.status == "complete" && tab.url.toLowerCase().indexOf("magiccards.info") > -1){
        chrome.pageAction.show(tab.id);
        chrome.tabs.sendMessage(tab.id, {action: "checkGET", url: tab.url});
    }
});
