chrome.runtime.onInstalled.addListener(function (details) {
    //set default assignments time to 20
    chrome.storage.sync.set({ atime1: '20' });
    chrome.storage.sync.set({ atime2: '20' });
    chrome.storage.sync.set({ atime3: '20' });
    chrome.storage.sync.set({ atime4: '20' });
    chrome.storage.sync.set({ atime5: '20' });
    chrome.storage.sync.set({ atime6: '20' });
    chrome.storage.sync.set({ atime7: '20' });
    
    //whether timeology is enabled
    chrome.storage.sync.set({ enabled: "false" });
    //whether courses have been read
    chrome.storage.sync.set({ coursesRead: 'false' });
    //whether user has done form
    chrome.storage.sync.set({doneForm: "false"});

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: 'fuhsd.schoology.com' },
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //delete form tab when submit
    if (request.greeting == "delete tab") {
        chrome.tabs.remove(sender.tab.id);
    }
    //navigate to schoology home
    if (request.greeting == "fuhsd url") {
        chrome.tabs.update(sender.tab.id, { url: 'https://fuhsd.schoology.com' });
    }
    //navigate to read courses
    if (request.greeting == "courses url") {
        chrome.tabs.update({ url: 'https://fuhsd.schoology.com/courses' });
    }
    //reload user's timology tab
    if (request.greeting == "reload tab") {
        chrome.storage.sync.get(['tabId'], function (val) {
            chrome.tabs.reload(+val.tabId);
        });
    }
});
