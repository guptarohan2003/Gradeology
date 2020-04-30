$(document).ready(function () {
    var courses = [];

    //for each courses title push into array
    $(".course-title").each(function (index, content) {
        var str = content.innerHTML;
        str = str.substring(0, str.length - 7);
        if(str != "Flex Studies"){
            courses.push(str);
        }
    }); 

    //store class in chrome sync storage
    if(courses[0])
    chrome.storage.sync.set({ class1: courses[0].toString() });
    if(courses[1])
    chrome.storage.sync.set({ class2: courses[1].toString() });
    if(courses[2])
    chrome.storage.sync.set({ class3: courses[2].toString() });
    if(courses[3])
    chrome.storage.sync.set({ class4: courses[3].toString() });
    if(courses[4])
    chrome.storage.sync.set({ class5: courses[4].toString() });
    if(courses[5])
    chrome.storage.sync.set({ class6: courses[5].toString() });
    if(courses[6])
    chrome.storage.sync.set({ class7: courses[6].toString() });

    chrome.storage.sync.set({ coursesRead: 'true' }, function () {
        chrome.runtime.sendMessage({ greeting: "fuhsd url" });
    });
})