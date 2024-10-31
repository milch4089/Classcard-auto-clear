let isClassCard = false;
let btn = document.getElementById("btn");
let title = document.getElementById("list-title");
let sectionText = document.getElementById("section_num");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs[0].url.startsWith("https://www.classcard.net/set/"));
    isClassCard = tabs[0].url.startsWith("https://www.classcard.net/set/");
    if(isClassCard == true) {
        chrome.tabs.sendMessage(
            tabs[0].id, {
                action: "getinfo"
            }
        );
    }
});

btn.addEventListener("click", async () => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(
            tab.id, {
                action: "start"
            }
        );
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == "sendinfo") {
        console.log(request.message[0]);
        title.innerText = request.message[0];
        sectionText.innerText = request.message[1];
    }
});

function test() {
//     let text2 = document.getElementById("test1");
//     let delay = 0;
//     for(let i=0;i<11;i++) {
//         delay += 800;
//         setTimeout(() => {
//         console.log(i);
//         text2.innerText = i.toString();
//        }, delay);
//     }
}