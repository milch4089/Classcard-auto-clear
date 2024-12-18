const RECALL_URL = "https://www.classcard.net/Recall/"
const MEMORIZE_URL = "https://www.classcard.net/Memorize/"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "ready") {

        chrome.tabs.onUpdated.addListener(function updateListener(tabId, changeInfo, tab) {
            console.log(changeInfo)
            if (changeInfo.title && tabId == sender.tab.id) {
                if (tab.url.startsWith(MEMORIZE_URL)||tab.url.startsWith(RECALL_URL)) {
                    chrome.scripting.insertCSS({
                        files: ["css/block.css"],
                        target: { tabId: tab.id }
                    });
                }
                chrome.tabs.sendMessage(
                    sender.tab.id, { action: "stateHandle" }
                );
            }

            if (changeInfo.status === "complete" && tabId == sender.tab.id) {
                
                if (tab.url.startsWith(MEMORIZE_URL)) {
                    chrome.tabs.sendMessage(
                        tabId, { action: "runMemorize" }
                    );
                } else if (tab.url.startsWith(RECALL_URL)) {
                    chrome.tabs.sendMessage(
                        tabId, { action: "runRecall" }
                    );
                }
                chrome.tabs.onUpdated.removeListener(updateListener);
            }

        });

    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.storage.local.get("ischecked", (result) => {
        if (tab.url.startsWith(RECALL_URL)&&result.ischecked) {
            console.log(result.ischecked)
            chrome.scripting.insertCSS({
                files: ["css/recall.css"],
                target: { tabId: tab.id }
            });
        }
      });
});