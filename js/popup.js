chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

let info = {
    title: "",
    start: "",
    end: ""
}
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if(tabs[0].status === "complete") {
        chrome.tabs.sendMessage(
            tabs[0].id, 
            {action: "getinfo", tabID: tabs[0].id}, 
            (response) => {
                $("#list-title").text(response);
                console.log(response)
                info.title = response;
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
                $("#list-title").text(response);
                info.title = response;
            }
        );
    }
});

$("#btn").click(()=>{

    info.start = Number($("#start").val());
    info.end = Number($("#end").val());
    chrome.storage.session.set(info);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id, {action: "set"}
        );
    });
    
});