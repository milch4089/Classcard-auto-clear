let tab_id

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === "getinfo") {
        tab_id = request.tabID
        sendResponse(getinfo());
    }
    if(request.action === "set") {
        setMemorize(request.start, request.end);
    }
    if(request.action === "run") {
        startMemorize();
    }
});

function getinfo() {
    let script_text = $("body script:eq(4)").html();
    let script_json = JSON.parse(script_text.substring(18, script_text.indexOf("var first_study_data")-2));
    let title = $('[property="og:title"]').attr("content");
    let section_num = $("#tab_set_section").children().length

    return [title, section_num];
}


function setMemorize(start_num, end_num) {
    chrome.runtime.sendMessage( 
        {action: "ready", tabID: tab_id}
    );
    $("#tab_set_section").children(`div:eq(${start_num-1})`).find("a:eq(2)")[0].click();
}

function startMemorize() {

    console.log("ok_run")
    
    let time = 5;
    let text = $(".btn-opt-start").text();

    let countDown = setInterval(() => {
        $(".btn-opt-start").attr("style", "display: block !important");
        $(".btn-opt-start").text(time);
        if(time <= 0) {
            $(".btn-opt-start")[0].click();
            $(".btn-opt-start").css("pointer-events", "auto");
            $(".btn-opt-start").text(text);
            clearInterval(countDown);
        }
        time--;
    }, 1000);
    setTimeout(() => {

        $(".btn-know-box").parent().attr("class", "study-bottom down");
        $(".btn-know-box > a")[0].click();

        let target = $(".btn-know-box").parent()[0];

        var observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.oldValue === "study-bottom invisible") {
                    setTimeout(() => {
                        $(".btn-know-box").parent().attr("class", "study-bottom down");
                        $(".btn-know-box > a")[0].click();
                        console.log("clear");
                    }, 500);
                    
                }
            });
        });

        var config = {
            attributes: true,
            attributeOldValue: true,
        };

        observer.observe(target, config);
    }, 8000);
    
    // observer.disconnect();

}