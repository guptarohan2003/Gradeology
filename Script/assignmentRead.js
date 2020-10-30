//total number of classes
var numClass = 0;
chrome.storage.sync.get(['numClasses'], function (val) {
    numClass = val.numClasses
})

$(document).ready(function () {
    chrome.storage.sync.set({ fuhsd: true });
    chrome.storage.sync.get(['coursesRead', 'enabled', 'hideOverdue', 'notif'], function (val) {
        // alert notification 
        setTimeout(function () {
            if (!val.notif) {
                alert('YOU CAN NOW HIDE OVERDUE ASSIGNMENTS!                                       -gradeology :)')
                chrome.storage.sync.set({ notif: true });
            }
        }, 200);

        // enable gradeology and hideOverdue button
        $("#right-column").prepend(hideOverdueButton());
        $("#right-column").prepend(enableGradeologyButton());
        var enableButton = $("#enableTime");

        // gradeology button handlers        
        if (val.enabled == 'true') {
            enableButton.hide()
        }
        enableButton.click(function () {
            chrome.storage.sync.set({ enabled: 'true' });

            if (val.coursesRead == 'false') {
                chrome.runtime.sendMessage({ greeting: "courses url" });
                return
            }
            chrome.runtime.sendMessage({ greeting: "reload tab" });
        });

        //time div
        if (val.coursesRead == 'true' && val.enabled == 'true') {
            $.ajax({
                type: "GET",
                url: '/home/upcoming_ajax',
                data: '',
                success: function (data) {
                    var assignments = [];
                    var dates = [];
                    var months = [];
                    var object = $('<div/>').html(data.html).contents();

                    var h4_list = $(object[1]).find('h4');

                    $.each(h4_list, function (index, element) {
                        // create a dummy object
                        var dummy = $('<div/>').html(element.outerHTML).contents();
                        // console.log(dummy[0].outerHTML);
                        var course = dummy.find('.realm-title-course');
                        if (course && course.length > 0 && course[0].outerText) {
                            //console.log(course[0].outerText);
                            var str = course[0].outerText;
                            var cut = str.lastIndexOf('-');
                            str = str.substring(0, cut - 1);

                            assignments.push(str);
                            if (assignments.length > dates.length) {
                                dates.push(dates[dates.length - 1]);
                                months.push(months[months.length - 1]);
                            }
                            //console.log(str.substring(0, cut - 1));
                        } else {
                            var assigDate = dummy[0].outerHTML;
                            var start = assigDate.indexOf(',');
                            assigDate = assigDate.substring(start + 2);
                            var end = assigDate.indexOf(',');
                            assigDate = assigDate.substring(0, end);
                            // console.log(assigDate);
                            var end = assigDate.indexOf(' ');
                            // console.log(assigDate.substring(end + 1) + 'e');
                            var duedate = assigDate.substring(end + 1);
                            var duemonth = assigDate.substring(0, end);
                            // console.log(duemonth);
                            var month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                            var monthNum = -1;
                            var i;
                            for (i = 0; i < 12; i++) {
                                var m = month[i];
                                if (m.localeCompare(duemonth) == 0) {
                                    monthNum = i;
                                    break;
                                }
                            }
                            dates.push(duedate);
                            months.push(monthNum);
                        }
                    });

                    var date = new Date();

                    //dayofweek
                    var due = date.getDay();
                    //set upcoming due date
                    if (due == 5)
                        date.setDate(date.getDate());
                    else if (due == 6)
                        date.setDate(date.getDate() + 2);
                    else
                        date.setDate(date.getDate() + 1);

                    var day = date.getDate();
                    var month = date.getMonth();
                    var i;
                    var today = [];
                    for (i = 0; i < dates.length; i++) {
                        if (month == months[i]) {
                            if (parseInt(dates[i]) <= day) today.push(assignments[i]);
                        }
                        else if (month > months[i]) today.push(assignments[i]);
                    }

                    //num of each assignment by class
                    var numAssignmentsTotal = new Array(numClass);
                    var numAssignmentsToday = new Array(numClass);

                    //set numAssignment for upcoming duedate
                    setNumAssignments(today, numAssignmentsToday);
                    //set numTotalAssignment for total
                    setNumAssignments(assignments, numAssignmentsTotal);

                    printTime(day, due, numAssignmentsTotal, numAssignmentsToday);
                },
                dataType: "json"
            });
        }

        //hideOverdue handlers -- timeout to allow for overdue load
        setTimeout(function () {
            var overdue = $('#overdue-submissions');
            if (overdue.length > 0) {
                var overdueButton = $("#hideOverdue");

                overdueButton.click(function () {
                    if (overdueButton[0].innerText == 'Hide Overdue Assignments') {
                        overdue.hide();
                        overdueButton[0].innerText = 'OVERDUE ASSIGNMENTS HIDDEN'
                        chrome.storage.sync.set({ hideOverdue: true })
                    } else {
                        overdue.show()
                        overdueButton[0].innerText = 'Hide Overdue Assignments'
                        chrome.storage.sync.set({ hideOverdue: false })
                    }
                })

                if (val.hideOverdue) {
                    overdueButton[0].innerText = 'OVERDUE ASSIGNMENTS HIDDEN'
                    overdue.hide();
                }
            }
        }, 200);
    });

});

function setNumAssignments(assignments, array) {

    var class_array = [];
    for (var i = 0; i < numClass; i++) {
        class_array.push('class' + i)
    }

    chrome.storage.sync.get(class_array, function (val) {
        for (var i = 0; i < numClass; i++) {
            array[i] = getOccurences(val['class' + i], assignments)
        }
    });

}

function printTime(day, due, totalAssigs, todayAssigs) {

    var assign_array = ['doneForm'];
    for (var i = 0; i < numClass; i++) {
        assign_array.push('atime' + i)
    }

    chrome.storage.sync.get(assign_array, function (items) {
        var totalZ = 0;
        for (var i = 0; i < numClass; i++) {
            totalZ += parseInt(items['atime' + i] * totalAssigs[i])
        }
        var totalZtoday = 0;
        for (var i = 0; i < numClass; i++) {
            totalZtoday += parseInt(items['atime' + i] * todayAssigs[i])
        }

        var hrsToday = Math.floor(totalZtoday / 60);
        var minToday = totalZtoday % 60;

        var temp = totalZ - totalZtoday;
        var hrs = Math.floor(temp / 60);
        var min = temp % 60;

        var datestr = 'the <span style="font-size:13px; color:#b51605"><b>';
        if (day == 1) datestr += "1st";
        else if (day == 2) datestr += "2nd";
        else if (day == 3) datestr += "3rd";
        else datestr += day + "th";
        if (due == 5) datestr = 'today night';
        datestr += '</b></span>';

        $(timeDiv(hrsToday, minToday, datestr, hrs, min)).insertAfter("#enableTime")
    });
}

function getOccurences(value, assignments) {
    var num = 0;
    var i;
    for (i = 0; i < assignments.length; i++) {
        if (assignments[i] == value.trim()) {
            num++;
        }
    }
    return num;
};

function timeDiv(hrsT, minT, date, hrs, min) {
    var div = document.createElement('div');
    div.setAttribute('id', 'timeDiv');
    div.setAttribute('style', "padding: 10px; border: 2px solid #b51605; border-radius: 25px; background:#dedede; margin-top: 7px;")
    var p = document.createElement('span');
    p.innerHTML = '<b>Amount of Homework</b>';
    var sp = document.createElement('span');
    var cssSpan = '<span style="font-size:13px; color:#b51605">';
    sp.innerHTML = '<br>You have about ' + cssSpan + '<b>' + hrsT + ' hrs and ' + minT + ' min</b></span> of HW for ' + date + '<br> and about ' + cssSpan + '<b>' + hrs + ' hrs and ' + min + ' min</b></span> of HW in the ' + cssSpan + '<b>near future</b></span>! Good Luck!!   <br><span style="font-size:16px; padding-left:13px"><i>  - Gradeology';
    div.appendChild(p);
    div.appendChild(sp);

    tipsDiv(div);

    return div;
}

function tipsDiv(div) {
    var tips = document.createElement('button');
    tips.innerHTML = 'Important Tips'
    tips.setAttribute('style', "float: right;margin-right: 60px;border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 20px; background-color:Ivory; color:black; width: 93px;");
    div.appendChild(tips);

    var fontSize = '10px';

    var disable = document.createElement('span');
    disable.setAttribute('id', 'disableSP')
    disable.setAttribute('style', 'display: none; font-size: ' + fontSize)
    disable.innerHTML = '<br><br>*<i><b>Disable Time Tools</b> and view the other features below by clicking the Extension Icon top right!'
    div.appendChild(disable);

    var incorrect = document.createElement('span');
    incorrect.setAttribute('id', 'incorrectSP')
    incorrect.setAttribute('style', 'display: none; font-size: ' + fontSize)
    incorrect.innerHTML = '<br>*<i><b>Click Reread Courses</b> if time incorrectly displays above  &nbsp&nbsp&nbsp&nbsp ex: 0 hrs 0 min when assignments are present'
    div.appendChild(incorrect);

    var reread = document.createElement('span');
    reread.setAttribute('id', 'rereadSP')
    reread.setAttribute('style', 'display: none; font-size: ' + fontSize)
    reread.innerHTML = '<br>*<i><b>Click Reread Courses</b> whenever you add or drop courses, including at the start of new school years!'
    div.appendChild(reread);

    var form = document.createElement('span');
    form.setAttribute('id', 'formSP')
    form.setAttribute('style', 'display: none; font-size: ' + fontSize)
    form.innerHTML = '<br>*<i>Fill the Time Form for better accuracy when estimating how much homework you have. It can be updated whenever!'
    div.appendChild(form);

    tips.addEventListener("click", function () {
        if (tips.innerText == 'Important Tips') {
            tips.innerHTML = 'Hide Tips'
            $('#disableSP').show();
            $('#rereadSP').show();
            $('#formSP').show();
            $('#incorrectSP').show();
        } else {
            tips.innerHTML = 'Important Tips'
            $('#disableSP').hide();
            $('#rereadSP').hide();
            $('#formSP').hide();
            $('#incorrectSP').hide();
        }
    });
}

function enableGradeologyButton() {
    var button = document.createElement('button');
    button.innerHTML = 'Enable Time Tools';
    button.setAttribute('id', 'enableTime');
    button.setAttribute('style', 'border-width: 2px; background-color:#b51605; color:white; margin-left:10px; font-size:10px; padding:10px; border-radius: 6px;');
    return button;
}

function hideOverdueButton() {
    var button = document.createElement('button');
    button.innerHTML = 'Hide Overdue Assignments';
    button.setAttribute('id', 'hideOverdue');
    button.setAttribute('style', 'border-width: 2px; border-color: #b51605; background-color:#d8d8d8; color:#8c0101; margin:10px 0px -10px 10px; font-size:10px; padding:5px 15px; border-radius: 6px;');
    return button;
}