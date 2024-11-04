chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == "ready") {

        chrome.tabs.onUpdated.addListener(function updateListener (tabId, changeInfo, tab) {

            if(tab.url.startsWith("https://www.classcard.net/Memorize/")) {
                chrome.scripting.insertCSS({
                    files: ["block.css"],
                    target: { tabId: tab.id }
                });
            }

            console.log(tabId, request.tabID)            
            if(changeInfo.status === "complete" && tabId == request.tabID){
                chrome.tabs.sendMessage(
                    tabId, {action: "run", start: request.start, end: request.end}
                );
            }
            
            if(changeInfo.status === "complete") {
                setTimeout(() => {
                    chrome.tabs.onUpdated.removeListener(updateListener);
                }, 1000);
            }

        });
        
    }
});
