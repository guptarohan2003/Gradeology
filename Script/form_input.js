document.addEventListener('DOMContentLoaded', function () {
    //set courses on form
    chrome.storage.sync.get(['numClasses'], function(v){
        var class_array = [];
        for(var i = 0; i < v.numClasses; i++){
            class_array.push('class' + i)
        }
        chrome.storage.sync.get(class_array, function(val){
            for(var i = 0; i < v.numClasses; i++){
                document.getElementById(i.toString()).innerHTML = val['class' + i];
            } 

            //15 hardcoded classes in html so remove unneeded ones
            for(var i = 14; i >= v.numClasses; i--){
                document.getElementById(i.toString()).remove();
                document.getElementById('i' + i.toString()).remove()
                document.getElementById('l' + i.toString()).remove()
            }
        });
    });

    document.getElementById("btn_submit").addEventListener("click", btnSubmitHandler);
});

function btnSubmitHandler() {
    chrome.storage.sync.get(['numClasses'], function(v){
        var save = {};
        for(var i = 0; i < v.numClasses; i++){
            var str = 'atime' + i;
            var time = document.getElementById('i' + i.toString()).value 
            save[str] = time
        }
        chrome.storage.sync.set(save);
    });

    alert('Thanks we got it!');
    chrome.runtime.sendMessage({ greeting: "reload tab" });
    chrome.runtime.sendMessage({ greeting: "delete tab" });
    chrome.storage.sync.set({doneForm:"true"});
}