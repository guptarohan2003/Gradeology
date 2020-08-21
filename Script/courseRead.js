$(document).ready(function () {
    chrome.storage.sync.get(['coursesRead'], function (val) {
        if (val.coursesRead == 'false') {
            var courses = [];

            //for each courses title push into array
            $(".course-title").each(function (index, content) {
                var str = content.innerHTML;
                if(str.length - 7 >= 5)
                    str = str.substring(0, str.length - 7);
                // if (str != "Flex Studies") {
                     courses.push(str);
                // }
            });
            chrome.storage.sync.set({ numClasses: courses.length.toString() });

            var save = {};
            courses.forEach(function(val, index){
                var myKey = 'class' + index; 
                var timestr = 'atime' + index

                save[myKey] = val;
                //set default assignments time to 20 
                save[timestr] = '20'
            
            })
            chrome.storage.sync.set(save);
            
            chrome.storage.sync.set({ coursesRead: 'true' }, function () {
                chrome.runtime.sendMessage({ greeting: "fuhsd url" });
            });
        }
    })
})