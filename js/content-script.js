const countdown_time = 3

let process_state = 0
let frist_section
let last_sectsion
let clear_list = []
let current_section
let delay;
let words_json;
let title;

let $known_count
let $total_count
let $know_btn
let $know_btn_box

let $study_box;
let $answer_btn;
let $card_cover;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request.action) {
        case "getInfo":

            let login_text = $("body script:eq(1)").html();
            let is_login = login_text.substring(16, login_text.indexOf("var is_login") + 19)
        
            console.log(is_login)
            if (is_login === "true") {
                sendResponse(getinfo());
            } else {
                chrome.runtime.sendMessage(
                    { action: "error", code: 1 }
                );
                sendResponse("error");
            }
            break;

        case "setMemorize":
            chrome.storage.session.get(["last"], (result) => {
                last_sectsion = result.last;
                setMemorize();
            });
            break;

        case "setRecall":
            setRecall();
            break;

        case "runMemorize":
            chrome.storage.session.get(["last", "frist", "clearList", "delay", "title"], (result) => {
                last_sectsion = result.last;
                frist_section = result.frist;
                clear_list = result.clearList;
                delay = result.delay
                title = result.title

                $known_count = $(".known_count:eq(1)");
                $total_count = $(".total_count");

                $know_btn = $(".btn-know-box > a");
                $know_btn_box = $(".btn-know-box").parent();

                startMemorize(true);

                chrome.runtime.sendMessage(
                    { action: "getState", state: process_state, _title: title }
                );
            });
            break;

        case "runRecall":
            chrome.runtime.sendMessage(
                { action: "getState", state: process_state, _title: title }
            );
            chrome.storage.session.get(["last", "frist", "clearList", "delay", "wordsJson", "title"], (result) => {
                last_sectsion = result.last;
                frist_section = result.frist;
                clear_list = result.clearList;
                delay = result.delay;
                words_json = result.wordsJson;
                title = result.title;

                $known_count = $(".known_count:eq(1)");
                $total_count = $(".total_count");

                $study_box = $(".study-content > .study-body")
                $know_btn = $(".btn-know-box > a");
                // $know_btn_box = $(".btn-next-box").parent();

                startRecall(true);
                // setTimeout(() => {
                //     findRecallAnswer("one");
                // }, 5000);
            });
            break;

        case "checkProcessState":
            chrome.storage.session.get(["title", "last"], (result) => {
                title = result.title;
                last_sectsion = result.last;
            });
            sendResponse([process_state, title, last_sectsion]);
            break;

        case "stateHandle":
            process_state = 1;
            break;
    }
});

function getinfo() {

    let script_text = $("body script:eq(4)").html();
    words_json = JSON.parse(script_text.substring(18, script_text.indexOf("var first_study_data") - 2));
    title = $('[property="og:title"]').attr("content");
    let words_num = words_json.length
    let size = Number($(".str_view_type:eq(0)").text().substring(0, $(".str_view_type:eq(0)").text().length - 4))

    let section_words_list = []
    let main_list = []

    let i = 0
    let data_len = words_json.length

    words_json.forEach((item, index) => {

        if (index + 1 == data_len) {
            main_list.push(!section_words_list.includes(-1))
        } else if (i >= size) {
            i = 0
            main_list.push(!section_words_list.includes(-1))
            section_words_list = []
        }
        section_words_list.push(Number(item.memorize_known_yn))
        i++

    });
    clear_list = main_list;
    let sections_num = main_list.length
    chrome.storage.session.set({ "clearList": main_list, "title": title, "wordsJson": words_json});
    return [title, words_num, sections_num];
}


function setMemorize() {
    chrome.runtime.sendMessage(
        { action: "ready" }
    );
    let first_index = clear_list.indexOf(false)
    chrome.storage.session.set({ frist: first_index + 1 });
    if (first_index+1 > last_sectsion) {
        chrome.runtime.sendMessage(
            { action: "error", code: 0 }
        );
    } else {
        $("#tab_set_section").children(`div:eq(${first_index})`).find("a:eq(2)")[0].click();
    }
}

function setRecall() {
    chrome.runtime.sendMessage(
        { action: "ready" }
    );
    let first_index = clear_list.indexOf(false)
    chrome.storage.session.set({ frist: first_index + 1 });
    $("#tab_set_section").children(`div:eq(${first_index})`).find("a:eq(3)")[0].click();
}

function checkNextSection(criterionSection) {
    if (criterionSection < clear_list.length) {
        if (clear_list[criterionSection] == true) {
            return checkNextSection(criterionSection + 1);
        } else {
            console.log("Next Section ", criterionSection + 1)
            return criterionSection + 1;
        }
    }
}

function countDown(frist) {
    let _time = countdown_time;
    let $start_btn = frist ? $(".btn-opt-start") : $(".btn-study-end-next-section2");
    let text = $start_btn.text();

    
    let count_down = setInterval(() => {
        $start_btn.attr("style", "display: block !important");
        $start_btn.text(_time);
        if (_time <= 0) {
            $start_btn[0].click();
            $start_btn.css("pointer-events", "auto");
            $start_btn.text(text);
            clearInterval(count_down);
        }
        _time--;
    }, 1000);
}

function startMemorize(frist) {

    current_section = frist ? frist_section : current_section;
    console.log("Current Section ", current_section)
    if (frist) $(".btn-know-box").parent().attr("class", "study-bottom");
    countDown(frist);

    setTimeout(() => {
        let known_count = 0

        let target = $know_btn_box[0];

        $know_btn_box.attr("class", "study-bottom down");
        $know_btn[0].click();

        let observer = new MutationObserver((mutations, _observer) => {
            mutations.forEach(mutation => {

                if ($know_btn_box.attr("class") === "study-bottom") {
                    setTimeout(() => {
                        $know_btn_box.attr("class", "study-bottom down");
                        $know_btn[0].click();
                        console.log("clear");
                    }, 20 + delay);
                }

                else if (mutation.target == $known_count[0]) {
                    if ($known_count.text() != known_count) {
                        known_count = $known_count.text();
                        if ($known_count.text() == $total_count.text()) {
                            console.log("finish");
                            _observer.disconnect();

                            setTimeout(() => {
                                let next_section = checkNextSection(current_section);
                                console.log(checkNextSection(current_section), last_sectsion)
                                if (next_section <= last_sectsion) {
                                    startMemorize(false);
                                    console.log("Go next ", next_section)
                                    current_section = next_section;
                                } else {
                                    console.log("fail")
                                    process_state = 2;
                                    chrome.runtime.sendMessage(
                                        { action: "get_state", state: process_state }
                                    );
                                    return 0;
                                }
                            }, 1000);
                        }
                    }
                }
            });
        });

        var config = {
            attributes: true,
            attributeOldValue: true,
            childList: true
        };

        observer.observe(target, config);
        observer.observe($known_count[0], config);
    }, 6000);

}

function findRecallAnswer(word) {
    words_json.forEach((item, index) => {
        if(item.front === word) {
            let $answer_btns = $study_box.children(".CardItem.current.showing").children(".card-quest");
            for(let i=0;i<$answer_btns.children().length-1;i++) {
                $answer_btn = $answer_btns.children(`:eq(${i})`);
                if ($answer_btn.children(".card-quest-list").children().text() === item.back) {
                    console.log($answer_btn)
                    $answer_btn.trigger("click");
                }
            }
        }
    });
}

function startRecall(frist) {

    current_section = frist ? frist_section : current_section;
    console.log("Current Section ", current_section);
    countDown(frist);

    setTimeout(() => {
        let known_count = 0

        let target;
        $card_cover = $study_box.children(".CardItem.next").children(".card-cover");
        // $card_cover.attr("class" , "card-cover");
        console.log($card_cover);
        target = $card_cover[0];
        // findRecallAnswer($study_box.find(".normal-body").text())

        let observer = new MutationObserver((mutations, _observer) => {
            mutations.forEach(mutation => {
                console.log(2, "!!!", mutation)
                if (mutation.oldValue === "card-cover") {
                    setTimeout(() => {
                        findRecallAnswer($study_box.find(".normal-body").text())
                        // console.log(2, "!!!", mutation)
                    }, 20 + delay);
                }
            });
        });

        var config = {
            attributes: true,
            attributeOldValue: true,
            childList: true
        };

        observer.observe(target, config);
        // observer.observe($known_count[0], config);
    }, 6000);

}
