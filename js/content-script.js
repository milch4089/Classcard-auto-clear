chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == "getinfo") {
        chrome.runtime.sendMessage({action: "sendinfo", message: getinfo()});
    }
});
function getinfo() {
    let script_text = document.body.querySelectorAll("script")[4].getHTML();
    let script_json = JSON.parse(script_text.substring(18, script_text.indexOf("var first_study_data")-2));
    let title = document.querySelector('[property="og:title"]').getAttribute("content");
    let section_num = document.getElementsByClassName("str_view_type")[0].innerText.substring(0,2)

    console.log(document.querySelector('[property="og:title"]').getAttribute("content"))
    console.log(
        
    );
    return [title, section_num, script_json];
}