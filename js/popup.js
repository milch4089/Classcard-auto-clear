chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

let info = {
    title: "",
    start: "",
    end: ""
}
let tab_id;
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tab_id = tabs[0].id
    setPopup(tabs[0])
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
    setPopup(tab)
});

function setPopup(tab) {
    if (tab.url.startsWith("https://www.classcard.net/set/")) {
        if(tab.status === "complete"){
            chrome.tabs.sendMessage(
                tab.id, 
                {action: "getinfo"}, 
                (response) => {
                    $("#list-title").text(response);
                    $(".loading-page").css("display", "none")
                    $(".main-page").css("display", "block")
                    info.title = response;
                }
            );
        }
    } else if (tab.url.startsWith("https://www.classcard.net/Memorize/")) {
        chrome.tabs.sendMessage(
            tab.id, 
            {action: "checkRun"}, 
            (response) => {
                if (response == 1) {
                    console.log("1")
                    $(".main-page").css("display", "none")
                    $(".running-page").css("display", "block")
                } else if (response == 2) {
                    $(".running-page").css("display", "none")
                    $(".main-page").css("display", "none")
                    $(".finish-page").css("display", "block")
                }
            }
        );
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request.action) {
        case "status":
            if (sender.tab.id == tab_id) {
                if (request.status == 1) {
                    $(".main-page").css("display", "none")
                    $(".running-page").css("display", "block")
                } else if (request.status == 2) {
                    $(".running-page").css("display", "none")
                    $(".main-page").css("display", "none")
                    $(".finish-page").css("display", "block")
                }
            }
            break;
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