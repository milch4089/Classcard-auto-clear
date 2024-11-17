const countdown_time = 3;

let process_state = 0;
let frist_section, last_sectsion;
let current_section, delay, words_json, title;

let clear_list = [];
let main_list_M = [];
let main_list_R = [];

let $known_count, $total_count, $know_btn, $know_btn_box;
let $study_box, $answer_btn, $card_current;

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
                clear_list = main_list_M;
                setMemorize();
            });
            break;

        case "setRecall":
            chrome.storage.session.get(["last"], (result) => {
                last_sectsion = result.last;
                clear_list = main_list_R;
                setRecall();
            });
            break;

        case "runMemorize":
            chrome.storage.session.get(["last", "frist", "clearList_M", "delay", "title"], (result) => {
                last_sectsion = result.last;
                frist_section = result.frist;
                clear_list = result.clearList_M;
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
            chrome.storage.session.get(["last", "frist", "clearList_R", "delay", "wordsJson", "title"], (result) => {
                last_sectsion = result.last;
                frist_section = result.frist;
                clear_list = result.clearList_R;
                console.debug(clear_list, result.clearList_R)
                delay = result.delay;
                words_json = result.wordsJson;
                title = result.title;

                $known_count = $(".known_count:eq(1)");
                $total_count = $(".total_count");

                $study_box = $(".study-content > .study-body")
                $know_btn = $(".btn-know-box > a");

                startRecall(true);
                chrome.runtime.sendMessage(
                    { action: "getState", state: process_state, _title: title }
                );
            });
            break;

        case "checkProcessState":
            sendResponse(process_state);
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

    let section_words_list_M = []
    main_list_M = []

    let section_words_list_R = []
    main_list_R = []

    let i = 0
    let data_len = words_json.length

    words_json.forEach((item, index) => {

        if (index + 1 == data_len) {
            main_list_M.push(!(section_words_list_M.includes(-1)||section_words_list_M.includes(0)));
            main_list_R.push(!(section_words_list_R.includes(-1)||section_words_list_R.includes(0)));
        } else if (i >= size) {
            i = 0
            main_list_M.push(!(section_words_list_M.includes(-1)||section_words_list_M.includes(0)));
            main_list_R.push(!(section_words_list_R.includes(-1)||section_words_list_R.includes(0)));
            section_words_list_M = []
            section_words_list_R = []
        }
        section_words_list_M.push(Number(item.memorize_known_yn))
        section_words_list_R.push(Number(item.recall_known_yn))
        i++

    });
    
    let sections_num = main_list_M.length
    console.debug(main_list_R, words_json)
    chrome.storage.session.set({ "clearList_M": main_list_M, "clearList_R": main_list_R, "title": title, "wordsJson": words_json});
    return [title, words_num, sections_num];
}


function setMemorize() {
    let first_index = clear_list.indexOf(false)
    chrome.storage.session.set({ frist: first_index + 1 });
    if (first_index+1 > last_sectsion) {
        chrome.runtime.sendMessage(
            { action: "error", code: 0 }
        );
    } else {
        chrome.runtime.sendMessage(
            { action: "ready" }
        );
        $("#tab_set_section").children(`div:eq(${first_index})`).find("a:eq(2)")[0].click();
    }
}

function setRecall() {
    let first_index = clear_list.indexOf(false)
    chrome.storage.session.set({ frist: first_index + 1 });
    if (first_index+1 > last_sectsion) {
        chrome.runtime.sendMessage(
            { action: "error", code: 0 }
        );
    } else {
        chrome.runtime.sendMessage(
            { action: "ready" }
        );
        $("#tab_set_section").children(`div:eq(${first_index})`).find("a:eq(3)")[0].click();
    }
}

function checkNextSection(criterionSection) {
    if (criterionSection < clear_list.length) {
        if (clear_list[criterionSection] == true) {
            return checkNextSection(criterionSection + 1);
        } else {
            console.debug("Next Section ", criterionSection + 1)
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
            $start_btn.attr("style", "display: none !important");
            clearInterval(count_down);
        }
        _time--;
    }, 1000);
}

function startMemorize(frist) {

    current_section = frist ? frist_section : current_section;
    console.debug("Current Section ", current_section)
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
                        console.debug("clear");
                    }, 20 + delay);
                }

                else if (mutation.target == $known_count[0]) {
                    if ($known_count.text() != known_count) {
                        known_count = $known_count.text();
                        if ($known_count.text() == $total_count.text()) {
                            console.debug("finish");
                            _observer.disconnect();

                            setTimeout(() => {
                                let next_section = checkNextSection(current_section);
                                console.debug(checkNextSection(current_section), last_sectsion)
                                if (next_section <= last_sectsion) {
                                    startMemorize(false);
                                    console.log("Go next ", next_section)
                                    current_section = next_section;
                                } else {
                                    console.debug("fail")
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
        if(item.front.replace(/(\s*)/g, "") === word.replace(/(\s*)/g, "")) {
            let $answer_btns = $card_current.children(".card-quest");
            for(let i=0;i<$answer_btns.children().length-1;i++) {
                $answer_btn = $answer_btns.children(`:eq(${i})`);
                if ($answer_btn.children(".card-quest-list").children().text().replace(/(\s*)/g, "") === item.back.replace(/(\s*)/g, "")) {
                    $answer_btn.trigger("click");
                }
            }
        }
    });
}

function startRecall(frist) {

    let word;
    let i = 0
    let j = 0
    current_section = frist ? frist_section : current_section;
    console.debug("Current Section ", current_section);
    countDown(frist);

    setTimeout(() => {

        let known_count = 0
        const regex = /[^0-9.]/g;
        $card_current = $study_box.children("[class='CardItem current showing']")
        let $card_cover = $card_current.children(".card-cover");

        word = $card_current.find(".normal-body").text();
        findRecallAnswer(word);

        let cardCover_observer = new MutationObserver((mutations, _observer) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === "style" && mutation.oldValue != null) {
                    let result = mutation.oldValue.replace(regex, "");
                    let number = parseFloat(result);
                    if(number>390) {
                        j++
                        if(j == 1) {
                            setTimeout(() => {
                                console.debug(number, $card_current, word);
                                findRecallAnswer(word);
                                cardItem_observer.observe($card_current[0], config);
                                i = 0;
                                _observer.disconnect();
                            }, 50+delay);
                        }
                    }
                }
            });
        });
        let cardItem_observer = new MutationObserver((mutations, _observer) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === "class") {
                        $study_box = $(".study-content > .study-body")
                        $card_current = $study_box.children(".CardItem.current.showing");
                        if ($card_current.attr("class") === "CardItem current showing") {
                            i++
                            if(i==1) {
                                word = $card_current.find(".normal-body").text();
                                $card_cover = $card_current.children(".card-cover");
                                j = 0;
                                cardCover_observer.observe($card_cover[0], config);
                            }
                            _observer.disconnect();
                        }
                }
            });
        });

        let known_observer = new MutationObserver((mutations, _observer) => {
            mutations.forEach(mutation => {
                if (mutation.target == $known_count[0]) {
                    if ($known_count.text() != known_count) {
                        known_count = $known_count.text();
                        if ($known_count.text() == $total_count.text()) {
                            console.debug("finish");
                            _observer.disconnect();
                            cardItem_observer.disconnect();
                            cardCover_observer.disconnect();
                            setTimeout(() => {
                                let next_section = checkNextSection(current_section);
                                console.debug(checkNextSection(current_section), last_sectsion)
                                if (next_section <= last_sectsion) {
                                    startRecall(false);
                                    console.debug("Go next ", next_section)
                                    current_section = next_section;
                                } else {
                                    console.debug("fail")
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

        // cardCover_observer.observe($card_cover[0], config);
        known_observer.observe($known_count[0], config);
        cardItem_observer.observe($card_current[0], config);
    }, 6500);

}