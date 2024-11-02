chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if(tabs[0].status === "complete") {
        chrome.tabs.sendMessage(
            tabs[0].id, 
            {action: "getinfo", tabID: tabs[0].id}, 
            (response) => {
                $("#list-title").text(response[0]);
            }
        );
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
    if(changeInfo.status === "complete" && tab.url.startsWith("https://www.classcard.net/set/")){
		chrome.tabs.sendMessage(
            tabId, 
            {action: "getinfo", tabID: tabId}, 
            (response) => {
                $("#list-title").text(response[0]);
            }
        );
    }
});

$("#btn").click(()=>{
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id, {action: "set", start: $("#start").val(), end: $("#end").val()}
        );
    });
})