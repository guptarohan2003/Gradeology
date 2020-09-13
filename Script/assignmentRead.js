//total number of classes
var numClass = 0;
chrome.storage.sync.get(['numClasses'], function (val) {
    numClass = val.numClasses
})

$(document).ready(function () {
    chrome.storage.sync.get(['coursesRead', 'enabled'], function (val) {

        // enable gradeology button
        $("#right-column").prepend(enableGradeologyButton());
        var enableButton = $("#enableGradeology");

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
                    var originalDate = date.getDate();
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

        var datestr = 'the <span style="font-size:13px; color:#ea2612"><b>';
        if (day == 1) datestr += "1st";
        else if (day == 2) datestr += "2nd";
        else if (day == 3) datestr += "3rd";
        else datestr += day + "th";
        if (due == 5) datestr = 'today night';
        datestr += '</b></span>';

        //var str = 'You have about <b>' + hrsToday + ' hrs and ' + minToday + ' min</b> of HW <b>for ' + datestr + '</b>  <br> <b> and about ' + hrs + ' hrs and ' + min + ' min</b> of HW in the <b>near future</b>! Good Luck!!   <br>  - Gradeology';
        // if (items.doneForm != "true") str += '<br><br>We recommend you to fill the personalized time form for better accuracy. Pop up form is available by clicking the extension icon.'
        // $("#right-column").prepend('<div id="timeology time" style="padding-left: 10px; padding-right: 10px; border: 1px solid #4CAF50; border-radius: 15px"><table> <tr> <th>Amount of Homework</th> </tr> <tr> <td id = "time display">' + str + '</td> </tr></table></div>');

        $(timeDiv(hrsToday, minToday, datestr, hrs, min, items.doneForm)).insertAfter("#enableGradeology")
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

function timeDiv(hrsT, minT, date, hrs, min, doneForm) {
    var div = document.createElement('div');
    div.setAttribute('id', 'timeDiv');
    div.setAttribute('style', "padding: 10px; border: 2px solid #ea2612; border-radius: 25px; background:#dedede; margin-top: 7px;")
    var p = document.createElement('span');
    p.innerHTML = '<b>Amount of Homework</b>';
    var sp = document.createElement('span');
    var cssSpan = '<span style="font-size:13px; color:#ea2612">';
    sp.innerHTML = '<br>You have about ' + cssSpan + '<b>' + hrsT + ' hrs and ' + minT + ' min</b></span> of HW for ' + date + '<br> and about ' + cssSpan + '<b>' + hrs + ' hrs and ' + min + ' min</b></span> of HW in the ' + cssSpan + '<b>near future</b></span>! Good Luck!!   <br><span style="font-size:16px; padding-left:13px"><i>  - Gradeology';
    div.appendChild(p);
    div.appendChild(sp);
    if (doneForm != 'true') {
        var form = document.createElement('span');
        form.innerHTML = '<br><br><i>We recommend you to fill the personalized time form for better accuracy. The form is available by clicking the extension icon and can be updated whenever.'
        div.appendChild(form);
    }
    var disable = document.createElement('span');
    disable.setAttribute('style', 'font-size: 10px;')
    disable.innerHTML = '<br><br>*<i><b>Disable Gradeology</b> and view other features by clicking the Extension Icon'
    div.appendChild(disable);

    return div;
}

function enableGradeologyButton() {
    var button = document.createElement('button');
    button.innerHTML = 'Enable Gradeology';
    button.setAttribute('id', 'enableGradeology');
    button.setAttribute('style', 'background-color:#f10505; color:white; margin-left:10px; font-size:10px; padding:10px; border-radius: 6px;');
    return button;
}