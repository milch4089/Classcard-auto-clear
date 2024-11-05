let running_status = 0
let info
let clear_list = []
let current_section

let $known_count
let $total_count
let $know_btn
let $know_btn_box

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request.action) {
        case "getinfo":
            chrome.runtime.sendMessage( 
                {action: "test", status: running_status}
            );
            sendResponse(getinfo());
            break;

        case "set":
            chrome.storage.session.get(["start", "end"], (result) => {
                setMemorize(result.start, result.end);;
            });
            break;

        case "run":
            chrome.storage.session.get(["clearList"], (result) => {
                clear_list = result.clearList;
            });
            chrome.storage.session.get(["start", "end"], (result) => {
                info = result;
    
                $known_count = $(".known_count:eq(1)");
                $total_count = $(".total_count");
    
                $know_btn = $(".btn-know-box > a");
                $know_btn_box = $(".btn-know-box").parent();
                startMemorize(true);
            });    
            break;
            
        case "checkRun":
            sendResponse(running_status)
            break;
    }
});

function getinfo() {

    let script_text = $("body script:eq(4)").html();
    let script_json = JSON.parse(script_text.substring(18, script_text.indexOf("var first_study_data")-2));
    let title = $('[property="og:title"]').attr("content");

    let size = Number($(".str_view_type:eq(0)").text().charAt(0))


    let section_words_list = []
    let main_list = []

    let i = 0
    let data_len = script_json.length

    script_json.forEach((item,index)=>{

        if (index+1==data_len) {
            main_list.push(!section_words_list.includes(-1))
        } else if (i>=size) {
            i = 0
            main_list.push(!section_words_list.includes(-1))
            section_words_list = []
        }
        section_words_list.push(Number(item.memorize_known_yn))
        i++	

    });

    chrome.storage.session.set({"clearList": main_list, "title": title});
    return title;
}


function setMemorize(start_num) {
    
    running_status = 1;
    chrome.runtime.sendMessage( 
        {action: "ready"}
    );
    chrome.runtime.sendMessage( 
        {action: "status", status: running_status}
    );
    // if( $(`.set-main:eq(${end_num-1}) .btn-memorize .cc.checked`).length == 1 ) {
    //     chrome.storage.session.set({end: info.end-1});
    // }
    $("#tab_set_section").children(`div:eq(${start_num-1})`).find("a:eq(2)")[0].click();
}

function checkNextSection(criterionSection) {
        if (criterionSection < clear_list.length) {
            if(clear_list[criterionSection]==true) {
                return checkNextSection(criterionSection+1);
            } else {
                console.log("Next Section ", criterionSection+1)
                return criterionSection+1;
            } 
        }
}

function startMemorize(frist) {
    
    console.log("ok_run");
    running_status = 1;
    
    let time = 3
    let $start_btn = frist ? $(".btn-opt-start") : $(".btn-study-end-next-section2");
    current_section = frist ? info.start : current_section;
    console.log("Current Section " , current_section)
    let text = $start_btn.text();
    if(frist) $(".btn-know-box").parent().attr("class", "study-bottom")

    let countDown = setInterval(() => {
        $start_btn.attr("style", "display: block !important");
        $start_btn.text(time);
        if(time <= 0) {
            $start_btn[0].click();
            $start_btn.css("pointer-events", "auto");
            $start_btn.text(text);
            clearInterval(countDown);
        }
        time--;
    }, 1000);

    
    setTimeout(() => {
        let known_count = 0

        let target = $know_btn_box[0];

        $know_btn_box.attr("class", "study-bottom down");
        $know_btn[0].click();

        let observer = new MutationObserver((mutations, _observer) => {
            mutations.forEach(mutation => {
               
                if($know_btn_box.attr("class") === "study-bottom") {
                    setTimeout(() => {
                        $know_btn_box.attr("class", "study-bottom down");
                        $know_btn[0].click();
                        // chrome.runtime.sendMessage({action: "runningInfo", info: [count,]})
                        console.log("clear");
                    }, 50);
                } 

                else if (mutation.target == $known_count[0]) {
                    if($known_count.text() != known_count) {
                        known_count = $known_count.text();
                        if ($known_count.text() == $total_count.text()) {
                            console.log("finish");
                            _observer.disconnect();
                            
                            setTimeout(() => {
                                let next_section = checkNextSection(current_section);
                                console.log(checkNextSection(current_section), info.end)
                                if(next_section <= info.end) {
                                    startMemorize(false);
                                    console.log("Go next ", next_section)
                                    current_section = next_section;
                                } else {
                                    console.log("fail")
                                    running_status = 2;
                                    chrome.runtime.sendMessage( 
                                        {action: "status", status: running_status}
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