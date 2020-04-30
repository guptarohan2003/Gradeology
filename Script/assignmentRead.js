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
                            if(assignments.length > dates.length){
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
                            var month = [];
                            month[0] = "January";
                            month[1] = "February";
                            month[2] = "March";
                            month[3] = "April";
                            month[4] = "May";
                            month[5] = "June";
                            month[6] = "July";
                            month[7] = "August";
                            month[8] = "September";
                            month[9] = "October";
                            month[10] = "November";
                            month[11] = "December";
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

                    //set numAssignment for upcoming duedate
                    setNumAssignments(today, true);
                    //set numTotalAssignment for total
                    setNumAssignments(assignments, false);

                    printTime(day, due);
                },
                dataType: "json"
            });
        }
    });

});

function setNumAssignments(assignments, today) {
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
        var a = getOccurences(val.class1, assignments).toString();
        var b = getOccurences(val.class2, assignments).toString();
        var c = getOccurences(val.class3, assignments).toString();
        var d = getOccurences(val.class4, assignments).toString();
        var e = getOccurences(val.class5, assignments).toString();
        var f = getOccurences(val.class6, assignments).toString();
        var g = getOccurences(val.class7, assignments).toString();

        if (!today) {
            chrome.storage.sync.set({ numAssigments1: a });
            chrome.storage.sync.set({ numAssigments2: b });
            chrome.storage.sync.set({ numAssigments3: c });
            chrome.storage.sync.set({ numAssigments4: d });
            chrome.storage.sync.set({ numAssigments5: e });
            chrome.storage.sync.set({ numAssigments6: f });
            chrome.storage.sync.set({ numAssigments7: g });
        } else {
            chrome.storage.sync.set({ numTodayAssigments1: a });
            chrome.storage.sync.set({ numTodayAssigments2: b });
            chrome.storage.sync.set({ numTodayAssigments3: c });
            chrome.storage.sync.set({ numTodayAssigments4: d });
            chrome.storage.sync.set({ numTodayAssigments5: e });
            chrome.storage.sync.set({ numTodayAssigments6: f });
            chrome.storage.sync.set({ numTodayAssigments7: g });
        }
    });
}

function printTime(day, due) {
    var assign_array = [
        'numAssigments1',
        'numAssigments2',
        'numAssigments3',
        'numAssigments4',
        'numAssigments5',
        'numAssigments6',
        'numAssigments7',
        'atime1',
        'atime2',
        'atime3',
        'atime4',
        'atime5',
        'atime6',
        'atime7',
        'numTodayAssigments1',
        'numTodayAssigments2',
        'numTodayAssigments3',
        'numTodayAssigments4',
        'numTodayAssigments5',
        'numTodayAssigments6',
        'numTodayAssigments7',
        'doneForm'
    ];
    chrome.storage.sync.get(assign_array, function (items) {
        var at1 = parseInt(items.atime1) * parseInt(items.numAssigments1);
        var at2 = parseInt(items.atime2) * parseInt(items.numAssigments2);
        var at3 = parseInt(items.atime3) * parseInt(items.numAssigments3);
        var at4 = parseInt(items.atime4) * parseInt(items.numAssigments4);
        var at5 = parseInt(items.atime5) * parseInt(items.numAssigments5);
        var at6 = parseInt(items.atime6) * parseInt(items.numAssigments6);
        var at7 = parseInt(items.atime7) * parseInt(items.numAssigments7);

        var totalZ = at1 + at2 + at3 + at4 + at5 + at6 + at7;

        at1 = parseInt(items.atime1) * parseInt(items.numTodayAssigments1);
        at2 = parseInt(items.atime2) * parseInt(items.numTodayAssigments2);
        at3 = parseInt(items.atime3) * parseInt(items.numTodayAssigments3);
        at4 = parseInt(items.atime4) * parseInt(items.numTodayAssigments4);
        at5 = parseInt(items.atime5) * parseInt(items.numTodayAssigments5);
        at6 = parseInt(items.atime6) * parseInt(items.numTodayAssigments6);
        at7 = parseInt(items.atime7) * parseInt(items.numTodayAssigments7);

        var totalZtoday = at1 + at2 + at3 + at4 + at5 + at6 + at7;
        var hrsToday = Math.floor(totalZtoday / 60);
        var minToday = totalZtoday % 60;

        var temp = totalZ - totalZtoday;
        var hrs = Math.floor(temp / 60);
        var min = temp % 60;

        var datestr = 'the ';
        if (day == 1) datestr += "1st";
        else if (day == 2) datestr += "2nd";
        else if (day == 3) datestr += "3rd";
        else datestr += day + "th";
        if (due == 5) datestr = 'today night';

        var str = 'You have about <b>' + hrsToday + ' hrs and ' + minToday + ' min</b> of HW <b>for ' + datestr + '</b>  <br> <b> and about ' + hrs + ' hrs and ' + min + ' min</b> of HW in the <b>near future</b>! Good Luck!!   <br>  - Gradeology';
        if (items.doneForm != "true") str += '<br><br>We recommend you to fill the personalized time form for better accuracy. Pop up form is available by clicking the extension icon.'
        $("#right-column").prepend('<div id="timeology time" style="padding-left: 10px; padding-right: 10px; border: 1px solid #4CAF50; border-radius: 15px"><table> <tr> <th>Amount of Homework</th> </tr> <tr> <td id = "time display">' + str + '</td> </tr></table></div>');
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

