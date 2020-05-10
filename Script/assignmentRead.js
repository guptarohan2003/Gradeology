$(document).ready(function () {
    chrome.storage.sync.get(['coursesRead', 'enabled'], function (val) {
        var bool = val.coursesRead;
        var enable = val.enabled;
        if (bool == 'true' && enable == 'true') {
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
                        // create a dummy objectt
                        var dummy = $('<div/>').html(element.outerHTML).contents();
                        // console.log(dummy[0].outerHTML);
                        var course = dummy.find('.realm-title-course');
                        if (course && course.length > 0 && course[0].outerText) {
                            //console.log(course[0].outerText);
                            var str = course[0].outerText;
                            var cut = str.indexOf('-');
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
                    var numAssignmentsTotal = new Array(7);
                    var numAssignmentsToday = new Array(7);

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
    var class_array = [
        'class1',
        'class2',
        'class3',
        'class4',
        'class5',
        'class6',
        'class7'
    ];
    chrome.storage.sync.get(class_array, function (val) {
        var occurencesArr = [getOccurences(val.class1, assignments), getOccurences(val.class2, assignments), getOccurences(val.class3, assignments), getOccurences(val.class4, assignments), getOccurences(val.class5, assignments), getOccurences(val.class6, assignments), getOccurences(val.class7, assignments)];

        for (var i = 0; i < 7; i++) {
            array[i] = occurencesArr[i];
        }
    });
}

function printTime(day, due, totalAssigs, todayAssigs) {
    var assign_array = [
        'atime1',
        'atime2',
        'atime3',
        'atime4',
        'atime5',
        'atime6',
        'atime7',
        'doneForm'
    ];
    chrome.storage.sync.get(assign_array, function (items) {
        var at1 = parseInt(items.atime1) * totalAssigs[0];
        var at2 = parseInt(items.atime2) * totalAssigs[1];
        var at3 = parseInt(items.atime3) * totalAssigs[2];
        var at4 = parseInt(items.atime4) * totalAssigs[3];
        var at5 = parseInt(items.atime5) * totalAssigs[4];
        var at6 = parseInt(items.atime6) * totalAssigs[5];
        var at7 = parseInt(items.atime7) * totalAssigs[6];

        var totalZ = at1 + at2 + at3 + at4 + at5 + at6 + at7;

        at1 = parseInt(items.atime1) * todayAssigs[0];
        at2 = parseInt(items.atime2) * todayAssigs[1];
        at3 = parseInt(items.atime3) * todayAssigs[2];
        at4 = parseInt(items.atime4) * todayAssigs[3];
        at5 = parseInt(items.atime5) * todayAssigs[4];
        at6 = parseInt(items.atime6) * todayAssigs[5];
        at7 = parseInt(items.atime7) * todayAssigs[6];

        var totalZtoday = at1 + at2 + at3 + at4 + at5 + at6 + at7;
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
        $("#right-column").prepend(timeDiv(hrsToday, minToday, datestr, hrs, min, items.doneForm));
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
    div.setAttribute('style', "padding: 10px; border: 2px solid #ea2612; border-radius: 25px; background:#dedede")
    var p = document.createElement('span');
    p.innerHTML = '<b>Amount of Homework</b>';
    var sp = document.createElement('span');
    var cssSpan = '<span style="font-size:13px; color:#ea2612">';
    sp.innerHTML = '<br>You have about '+cssSpan+'<b>' + hrsT + ' hrs and ' + minT + ' min</b></span> of HW for ' + date + '<br> and about '+cssSpan+'<b>' + hrs + ' hrs and ' + min + ' min</b></span> of HW in the '+cssSpan+'<b>near future</b></span>! Good Luck!!   <br><span style="font-size:16px; padding-left:13px"><i>  - Gradeology';
    div.appendChild(p);
    div.appendChild(sp);
    if (doneForm != 'true') {
        var form = document.createElement('span');
        form.innerHTML = '<br><br><i>We recommend you to fill the personalized time form for better accuracy. The form is available by clicking the extension icon.'
        div.appendChild(form);
    }
    return div;
}