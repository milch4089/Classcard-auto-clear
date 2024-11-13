chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

const SET_URL = "https://www.classcard.net/set/"
const MEMORIZE_URL = "https://www.classcard.net/Memorize/"
const STATE_MESSAGE = {run: "암기 자동화가 실행 중 입니다", finish: "암기 자동화가 종료되었습니다"}
const ERROR_MESSAGE = { 
    not_login: "로그인이 필요합니다", 
    not_classCard: "단어를 찾을 수 없습니다", 
    not_wordSet: "단어세트만 가능합니다", 
    not_findInfo: "세트정보를 불러올 수 없습니다.</br>새로고침을 해주세요.",
    wrong_endSection: "입력한 종료구간이 존재하지 않습니다",
    cleared_already: "이미 암기가 완료된 구간들 입니다",
    exceed_maxSection: "종료구간이 마지막 구간보다 큽니다"
}
let tab_id;
let sections_num;
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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => { 
    console.log(msg); 
    sendResponse(); 
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
                        if (response != "error") {
                            $title.text(response[0]);
                            $("#words-num").text(response[1])
                            $("#sections-num").text(response[2])
                            sections_num = response[2]
                            $memorize_btn.attr("disabled", false);
                            // $recall_btn.attr("disabled", false);
                        }
                    } catch {
                        // showStateText(ERROR_MESSAGE.not_findInfo);
                        return 0;
                    }
                }
            );
        } else if (tab.url.startsWith(MEMORIZE_URL)) {
            chrome.tabs.sendMessage(
                tab.id,
                { action: "checkProcessState" },
                (response) => {
                    console.log(response, " !!!")
                    switch (response[0]) {
                        case 0:
                            showStateText(ERROR_MESSAGE.not_classCard)
                            break;
                        case 1:
                            showStateText(STATE_MESSAGE.run)
                            $title.text(response[1]);
                            break;
                        case 2:
                            showStateText(STATE_MESSAGE.finish)
                            $title.text(response[1]);
                            break;
                    }
                }
            );
        } else {
            showStateText(ERROR_MESSAGE.not_classCard)
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getState" && sender.tab.id == tab_id) {
        switch (request.state) {
            case 1:
                showStateText(STATE_MESSAGE.run)
                $title.text(request._title);
                break;
            case 2:
                showStateText(STATE_MESSAGE.finish)
                $title.text(request._title);
                break;
        }
    }
    if (request.action === "error" && sender.tab.id == tab_id) {
        switch (request.code) {
            case 0:
                showStateText(ERROR_MESSAGE.cleared_already, 2000)
                break;

            case 1:
                showStateText(ERROR_MESSAGE.not_login);
                break;
        }
    }
});

function showStateText(msg, unblock_time=0) {
    $info_text.css("display", "none");
    $state_text.css("display", "block");
    $input.attr("disabled", true);
    $state_text.html(msg)
    if (unblock_time !=0) {
        setTimeout(() => {
            $info_text.css("display", "block");
            $state_text.css("display", "none");
            $input.attr("disabled", false);

            // $recall_btn.attr("disabled", false);
            $memorize_btn.attr("disabled", false);

        }, unblock_time);
    }
}

$memorize_btn.click(() => {

    $memorize_btn.attr("disabled", true);
    if (Number($("#end").val()) > sections_num) {
        showStateText(ERROR_MESSAGE.exceed_maxSection, 2400)
    } else {
        chrome.storage.session.set({ last: Number($("#end").val()), delay: Number($("#delay").val()) });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id, { action: "setMemorize" }
            );
        });
    }

});

$recall_btn.click(() => {

    $recall_btn.attr("disabled", true);
    chrome.storage.session.set({ last: Number($("#end").val()), delay: Number($("#delay").val()) });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id, { action: "setRecall" }
        );
    });

});