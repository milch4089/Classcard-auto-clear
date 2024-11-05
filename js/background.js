chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == "ready") {

        chrome.tabs.onUpdated.addListener(function updateListener (tabId, changeInfo, tab) {

            if(tab.url.startsWith("https://www.classcard.net/Memorize/")) {
                chrome.scripting.insertCSS({
                    files: ["block.css"],
                    target: { tabId: tab.id }
                });
            }
           
            if(changeInfo.status === "complete" && tabId == sender.tab.id){
                chrome.tabs.sendMessage(
                    tabId, {action: "run"}
                );
            }
            
            if(changeInfo.status === "complete") {
                chrome.tabs.onUpdated.removeListener(updateListener);
            }

        });
        
    }
});
