document.addEventListener('DOMContentLoaded', function () {
    //store tabid
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currTab = tabs[0];
        if (currTab) {
            chrome.storage.sync.set({ tabId: currTab.id.toString() });
        }
    });

    chrome.storage.sync.get(['enabled'], function (val) {
        if (val.enabled == 'true') {
            enable()
        } else {
            disable()
        }
    });

    document.getElementById("disableTime").addEventListener("click", function(){
        chrome.storage.sync.set({ enabled: "false" });
        disable();
        chrome.tabs.reload();
    })

    document.getElementById("go_to_form").addEventListener("click", function () {
        chrome.tabs.create({ url: "form.html" });
    });

    document.getElementById("reread_courses").addEventListener("click", function () {
        chrome.runtime.sendMessage({ greeting: "courses url" });
        chrome.storage.sync.set({ coursesRead: 'false' })
    });

});

function disable() {
    document.getElementById("go_to_form").style.display = "none";
    document.getElementById("disableTime").style.display = "none";
    document.getElementById("reread_courses").style.display = "none";
}

function enable() {
    document.getElementById("go_to_form").style.display = "inline";
    document.getElementById("disableTime").style.display = "inline";
    document.getElementById("reread_courses").style.display = "inline";
}
