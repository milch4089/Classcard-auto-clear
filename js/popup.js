chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

let tab_id;
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tab_id = tabs[0].id
    setPopup(tabs[0])
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
    setPopup(tab)
});

function setPopup(tab) {
    if(tab.id == tab_id && tab.status === "complete") {
        $(".loading-page").css("display", "none")
        if (tab.url.startsWith("https://www.classcard.net/set/")) {
            chrome.tabs.sendMessage(
                tab.id, 
                {action: "getinfo"}, 
                (response) => {
                    $("#title").text(response[0]);
                    $("#words-num").text(response[1])
                    $("#sections-num").text(response[2])
                }
            );
        } else if (tab.url.startsWith("https://www.classcard.net/Memorize/")) {
            chrome.tabs.sendMessage(
                tab.id, 
                {action: "checkRun"}, 
                (response) => {
                    if (response == 1) {
                        console.log("1")
                        $(".running-page").css("display", "flex")
                    } else if (response == 2) {
                        $(".running-page").css("display", "none")
                        $(".finish-page").css("display", "flex")
                    }
                }
            );
        } else {
                $(".error-page").css("display", "flex")
            } 
        }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request.action) {
        case "status":
            if (sender.tab.id == tab_id) {
                $(".loading-page").css("display", "none")
                if (request.status == 1) {
                    $(".running-page").css("display", "flex")
                } else if (request.status == 2) {
                    $(".running-page").css("display", "none")
                    $(".finish-page").css("display", "flex")
                }
            }
            break;
    }
});

$("#memo-btn").click(()=>{

    chrome.storage.session.set({last: Number($("#end").val()), delay: Number($("#delay").val())});

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id, {action: "set"}
        );
    });
    
});