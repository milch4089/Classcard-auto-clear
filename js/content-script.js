chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == "getinfo") {
        sendResponse(getinfo());
    }
    if(request.action == "start") {
        setMemorize(request.start, request.end);
    }
});
function getinfo() {
    let script_text = $("body script:eq(4)").html();
    let script_json = JSON.parse(script_text.substring(18, script_text.indexOf("var first_study_data")-2));
    let title = $('[property="og:title"]').attr("content");
    let section_num = $(".str_view_type:eq(0)").text().substring(0,2)

    console.log(section_num);
    return [title, section_num, script_json];
}

function setMemorize(start_num, end_num) {
    console.log(start_num, end_num);
    $("#tab_set_section").children(`div:eq(${start_num-1})`).find("a:eq(2)")[0].click()
}

function startMemorize () {

}