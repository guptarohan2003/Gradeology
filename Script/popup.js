document.addEventListener('DOMContentLoaded', function () {
    //store tabid
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currTab = tabs[0];
        if (currTab) {
            chrome.storage.sync.set({ tabId: currTab.id.toString() });
        }
    });

    chrome.storage.sync.get(['enabled'], function (val) {
        var value = val.enabled;
        if (value == 'true') {
            document.getElementById("enableGradeology").innerHTML = 'Disable Gradeology';
            document.getElementById("go_to_form").style.display = "inline";
        } else {
            document.getElementById("enableGradeology").innerHTML = "Enable Gradeology";
            document.getElementById("go_to_form").style.display = "none";
        }
    }); 

    document.getElementById("enableGradeology").addEventListener("click", function () {
        if (document.getElementById("enableGradeology").innerHTML == 'Enable Gradeology') {
            chrome.storage.sync.get(['coursesRead'], function (val) {
                if (val.coursesRead == 'false') {
                    chrome.runtime.sendMessage({ greeting: "courses url" });
                }
                document.getElementById("go_to_form").style.display = "inline";
                document.getElementById("enableGradeology").innerHTML = "Disable Gradeology";
                chrome.storage.sync.set({ enabled: "true" });
                chrome.tabs.reload();
            });
        } else {
            document.getElementById("go_to_form").style.display = "none";
            document.getElementById("enableGradeology").innerHTML = "Enable Gradeology";
            chrome.storage.sync.set({ enabled: "false" });
            chrome.tabs.reload();
        }
    });
    document.getElementById("go_to_form").addEventListener("click", function () {
        chrome.tabs.create({ url: "form.html" });
    });
});
