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
            document.getElementById("enableGradeology").innerHTML = 'Disable Gradeology';
            document.getElementById("go_to_form").style.display = "inline";
            document.getElementById("reread_courses").style.display = "inline";
        } else {
            document.getElementById("enableGradeology").innerHTML = "Enable Gradeology";
            document.getElementById("go_to_form").style.display = "none";
            document.getElementById("reread_courses").style.display = "none";
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
                document.getElementById("reread_courses").style.display = "inline";
                chrome.storage.sync.set({ enabled: "true" });
                chrome.tabs.reload();
            });
        } else {
            document.getElementById("go_to_form").style.display = "none";
            document.getElementById("enableGradeology").innerHTML = "Enable Gradeology";
            document.getElementById("reread_courses").style.display = "none";
            chrome.storage.sync.set({ enabled: "false" });
            chrome.tabs.reload();
        }
    });

    document.getElementById("go_to_form").addEventListener("click", function () {
        chrome.tabs.create({ url: "form.html" });
    });

    document.getElementById("reread_courses").addEventListener("click", function () {
        chrome.runtime.sendMessage({ greeting: "courses url" });
        chrome.storage.sync.set({ coursesRead: 'false' })
    });

});
