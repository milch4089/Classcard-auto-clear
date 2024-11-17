chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

const SET_URL = "https://www.classcard.net/set/"
const MEMORIZE_URL = "https://www.classcard.net/Memorize/"
const RECALL_URL = "https://www.classcard.net/Recall/"

let tab_id, sections_num;
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
                            $recall_btn.attr("disabled", false);
                        }
                    } catch {
                        // showStateText(ERROR_MESSAGE.not_findInfo);
                        return 0;
                    }
                }
            );
        } else if (tab.url.startsWith(MEMORIZE_URL) || tab.url.startsWith(RECALL_URL)) {
            chrome.tabs.sendMessage(
                tab.id,
                { action: "checkProcessState" },
                (response) => {
                    console.log(response, " !!!")
                    switch (response) {
                        case 0:
                            showStateText(ERROR_MESSAGE.not_classCard)
                            break;
                        case 1:
                            showStateText(tab.url.startsWith(MEMORIZE_URL) ? STATE_MESSAGE.m_run : STATE_MESSAGE.r_run)
                            chrome.storage.session.get(["title", "last"], (result) => {
                                $title.text(result.title);
                                $("#end").val(result.last);
                            });
                            break;
                        case 2:
                            showStateText(tab.url.startsWith(MEMORIZE_URL) ? STATE_MESSAGE.m_finish : STATE_MESSAGE.r_finish)
                            chrome.storage.session.get(["title", "last"], (result) => {
                                $title.text(result.title);
                                $("#end").val(result.last);
                            });
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
                showStateText(sender.tab.url.startsWith(MEMORIZE_URL) ? STATE_MESSAGE.m_run : STATE_MESSAGE.r_run)
                $title.text(request._title);
                break;
            case 2:
                showStateText(sender.tab.url.startsWith(MEMORIZE_URL) ? STATE_MESSAGE.m_finish : STATE_MESSAGE.r_finish)
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
            $("button").attr("disabled", false);
        }, unblock_time);
    }
}

$(document).ready(function() {			
    $("input").keyup(function() {
        var replace_text = $(this).val().replace(/[^-0-9]/g, '');
        $(this).val(replace_text);
    });
});

$memorize_btn.click(() => {

    $("button").attr("disabled", true);
    if (Number($("#end").val()) > sections_num) {
        showStateText(ERROR_MESSAGE.wrong_endSection, 2400)
    } else if (Number($("#end").val()) <= 0 ) {
        $("#end").val(0);
        showStateText(ERROR_MESSAGE.wrong_endSection, 2400)
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

    $("button").attr("disabled", true);
    if (Number($("#end").val()) > sections_num) {
        showStateText(ERROR_MESSAGE.wrong_endSection, 2400)
    } else if (Number($("#end").val()) <= 0 ) {
        $("#end").val(0);
        showStateText(ERROR_MESSAGE.wrong_endSection, 2400)
    } else {
        chrome.storage.session.set({ last: Number($("#end").val()), delay: Number($("#delay").val()) });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id, { action: "setRecall" }
            );
        });
    }

});