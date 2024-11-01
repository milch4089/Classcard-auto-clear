let isClassCard = false;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs[0].url.startsWith("https://www.classcard.net/set/"));
    isClassCard = tabs[0].url.startsWith("https://www.classcard.net/set/");
    if(isClassCard == true) {
        chrome.tabs.sendMessage(
            tabs[0].id, 
            {action: "getinfo"}, 
            (response) => {
                $("#list-title").text(response[0]);
            }
        );
        chrome.tabs.sendMessage(
            tabs[0].id, 
            {action: "chechRun"}, 
            (response) => {
                console.log(response)
            }
        );
    }else{
        
    }
});

$("#btn").click(()=>{
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id, {action: "start", start: $("#start").val(), end: $("#end").val()}
        );
    });
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == "sendinfo") {

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