let tab_id
let isRunning = false
let info
let clear_list = []
let current_section

let $known_count
let $total_count
let $know_btn
let $know_btn_box

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === "getinfo") {
        tab_id = request.tabID
        sendResponse(getinfo());
    }
    if(request.action === "set") {
        chrome.storage.session.get(["start", "end"], (result) => {
            setMemorize(result.start, result.end);;
        });
    }
    if(request.action === "run") {
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
        
    }
    if(request.action === "checkRun") {
        sendResponse(isRunning)
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
            console.log(2)
        }
        section_words_list.push(Number(item.memorize_known_yn))
        i++	

    });

    console.log(script_json, main_list, typeof(script_json))
    chrome.storage.session.set({"clearList": main_list});
    return title;
}


function setMemorize(start_num, end_num) {
    
    isRunning = true;
    chrome.runtime.sendMessage( 
        {action: "ready", tabID: tab_id, start: start_num, end: end_num}
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

function checkSection() {

    let section_data = $("body script:eq(6)").html();
    let section_num = section_data.charAt(section_data.indexOf("current_section")+18);
    console.log(section_data);
    console.log(Number(section_num), info.end, section_num);
    if(Number(section_num) >= info.end ) {
        return false;
    } else {
        return true;
    }
}
function startMemorize(frist) {
    
    console.log("ok_run");
    isRunning = true
    
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

        console.log("running2")
        let observer = new MutationObserver((mutations, _observer) => {
            mutations.forEach(mutation => {
               
                if($know_btn_box.attr("class") === "study-bottom") {
                    console.log("test1")
                    console.log($known_count[0])
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
                        console.log("test");

                        if ($known_count.text() == $total_count.text()) {
                            console.log("testfinish");
                            _observer.disconnect();
                            
                            setTimeout(() => {
                                let next_section = checkNextSection(current_section);
                                console.log(checkNextSection(current_section), info.end)
                                if(next_section <= info.end) {
                                    startMemorize(false);
                                    console.log("Go next")
                                    current_section = next_section;
                                } else {
                                    console.log("fail")
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

function test() {

}
