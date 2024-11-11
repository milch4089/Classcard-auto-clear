chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

const SET_URL = "https://www.classcard.net/set/"
const MEMORIZE_URL = "https://www.classcard.net/Memorize/"
const STATE_MESSAGE = {run: "암기 자동화가 실행 중 입니다", finish: "암기 자동화가 종료되었습니다"}
const ERROR_MESSAGE = { 
    not_login: "로그인이 필요합니다", 
    not_classCard: "단어를 찾을 수 없습니다", 
    not_wordSet: "단어세트만 가능합니다", 
    not_findInfo: "세트정보를 불러올 수 없습니다"
}
let tab_id;
let $title = $("#title");
let $state_text = $("#state-text");
let $memorize_btn = $("#memo-btn");
let $recall_btn = $("#recall-btn");
let $info_text = $(".info-text");
let $input = $("input");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tab_id = tabs[0].id
    setPopup(tabs[0])
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    setPopup(tab)
});

function setPopup(tab) {
    if (tab.id == tab_id && tab.status === "complete") {
        if (tab.url.startsWith(SET_URL)) {
            $("body").css("pointer-events", "auto")
            chrome.tabs.sendMessage(
                tab.id,
                { action: "getInfo" },
                (response) => {
                    try {
                        $title.text(response[0]);
                        $("#words-num").text(response[1])
                        $("#sections-num").text(response[2])
                        $memorize_btn.attr("disabled", false);
                        // $recall_btn.attr("disabled", false);
                    } catch {
                        $info_text.css("display", "none");
                        $state_text.css("display", "block");
                        $input.attr("disabled", true);
                        $state_text.text(ERROR_MESSAGE.not_findInfo)
                    }
                }
            );
        } else if (tab.url.startsWith(MEMORIZE_URL)) {
            chrome.tabs.sendMessage(
                tab.id,
                { action: "checkProcessState" },
                (response) => {
                    $info_text.css("display", "none");
                    $state_text.css("display", "block");
                    $input.attr("disabled", true);
                    switch (response) {
                        case 0:
                            $state_text.text(ERROR_MESSAGE.not_classCard)
                            break;
                        case 1:
                            $state_text.text(STATE_MESSAGE.run)
                            break;
                        case 2:
                            $state_text.text(STATE_MESSAGE.finish)
                            break;
                    }
                }
            );
        } else {
            $info_text.css("display", "none");
            $state_text.css("display", "block");
            $input.attr("disabled", true);
            $state_text.text(ERROR_MESSAGE.not_classCard)
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getState" && sender.tab.id == tab_id) {
        $info_text.css("display", "none");
        $state_text.css("display", "block");
        $input.attr("disabled", true);
        switch (request.action) {
            case 1:
                $state_text.text(STATE_MESSAGE.run)
                break;
            case 2:
                $state_text.text(STATE_MESSAGE.finish)
                break;
        }
    }
});

$memorize_btn.click(() => {

    chrome.storage.session.set({ last: Number($("#end").val()), delay: Number($("#delay").val()) });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id, { action: "setMemorize" }
        );
    });

});

$recall_btn.click(() => {

    chrome.storage.session.set({ last: Number($("#end").val()), delay: Number($("#delay").val()) });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id, { action: "setRecall" }
        );
    });

});