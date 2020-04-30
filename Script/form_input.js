document.addEventListener('DOMContentLoaded', function () {
    var class_array = [
        'class1',
        'class2',
        'class3',
        'class4',
        'class5',
        'class6',
        'class7'
    ]; 
    //set courses on form
    chrome.storage.sync.get(class_array, function(val){
        document.getElementById("A").innerHTML = val.class1;
        document.getElementById("B").innerHTML = val.class2;
        document.getElementById("C").innerHTML = val.class3;
        document.getElementById("D").innerHTML = val.class4;
        document.getElementById("E").innerHTML = val.class5;
        document.getElementById("F").innerHTML = val.class6;
        document.getElementById("G").innerHTML = val.class7;

    });

    document.getElementById("btn_submit").addEventListener("click", btnSubmitHandler);
});

function btnSubmitHandler() {
    var form = document.forms["myForm"];

    var atime1 = parseInt(form.elements[0].value) * 60 + parseInt(form.elements[1].value);
    if(atime1 == 0) atime1 = 5;
    chrome.storage.sync.set({ atime1: atime1.toString() });
    var atime2 = parseInt(form.elements[2].value) * 60 + parseInt(form.elements[3].value);
    if(atime2 == 0) atime2 = 5;
    chrome.storage.sync.set({ atime2: atime2.toString() });
    var atime3 = parseInt(form.elements[4].value) * 60 + parseInt(form.elements[5].value);
    if(atime3 == 0) atime3 = 5;
    chrome.storage.sync.set({ atime3: atime3.toString() });
    var atime4 = parseInt(form.elements[6].value) * 60 + parseInt(form.elements[7].value);
    if(atime4 == 0) atime4  = 5;
    chrome.storage.sync.set({ atime4: atime4.toString() });
    var atime5 = parseInt(form.elements[8].value) * 60 + parseInt(form.elements[9].value);
    if(atime5 == 0) atime5 = 5;
    chrome.storage.sync.set({ atime5: atime5.toString() });
    var atime6 = parseInt(form.elements[10].value) * 60 + parseInt(form.elements[11].value);
    if(atime6 == 0) atime6 = 5;
    chrome.storage.sync.set({ atime6: atime6.toString() });
    var atime7 = parseInt(form.elements[12].value) * 60 + parseInt(form.elements[13].value);
    if(atime7 == 0) atime7 = 5;
    chrome.storage.sync.set({ atime7: atime7.toString() });

    form.reset();

    alert('Thanks we got it!');
    chrome.runtime.sendMessage({ greeting: "reload tab" });
    chrome.runtime.sendMessage({ greeting: "delete tab" });
    chrome.storage.sync.set({doneForm:"true"});
}