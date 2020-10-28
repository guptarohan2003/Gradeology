var isFuhsd;
chrome.storage.sync.get(['fuhsd'], function(val){
    isFuhsd = val.fuhsd;
})
$(document).ready(function () {
    var courses = $('.gradebook-course');
    var semesterNum = new Date().getMonth() >= 7 ? 1 : 2;

    var class_names = [];
    var summaryDivInfoCourses = [];
    
    for (var i = 0; i < courses.length; i++) {
        var courseName = courses[i].innerText;
        courseName = courseName.substring(0, courseName.lastIndexOf(':'))
        if(!isNaN(courseName.substring(courseName.length - 2, courseName.length)))
            courseName = courseName.substring(0, courseName.length - 7);
        else 
            courseName = 'delete';

        var origGrade = courses.eq(i).find('.period-row').eq(semesterNum - 1)[0].children[1].innerText;
        origGrade = origGrade.substring(origGrade.indexOf('(') + 1, origGrade.indexOf('%') + 1);
        if(origGrade != "") origGrade = ':&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp' + origGrade;

        class_names.push(courseName + origGrade)
        summaryDivInfoCourses.push(summaryDivInfo(courses.eq(i)))
    }

    //create button and final calc div
    $('#center-top').append(createButtonDiv(class_names));
    $('#finalGradeDiv').find('div#finalCalc').hide();
    finalCalculatorHandlers();
    $('#enableFinalCalc')[0].style['margin-left'] = '26px';
    $('#enableFinalCalc')[0].style['margin-top'] = '3px';

    $('button.enableCalc').click(function (element) {
        //course info
        var courseNum = element.target.attributes['courseNum'].value;
        var course = courses.eq(courseNum - 1);

        //current semester info
        var semester = course.find('.period-row').eq(semesterNum - 1);
        var semesterid = semester[0].attributes['data-id'].value;

        //original grade
        var originalGrade = semester[0].children[1].innerText;
        originalGrade = originalGrade.substring(originalGrade.indexOf('(') + 1, originalGrade.indexOf('%') + 1);
        
        var add = setColorOfButton(element.target, false);
        if (add) {
            course.find('.gradebook-course-grades')[0].style['display'] = 'block'
            calculator(course, courseNum, semester, semesterid, originalGrade, summaryDivInfoCourses[courseNum - 1])
            $('#input' + courseNum)[0].style['margin-bottom'] = '7px';
        } else {
            course.find('.gradebook-course-grades')[0].style['display'] = 'none'
            removeCalculator(course, courseNum, semester, semesterid, summaryDivInfoCourses[courseNum - 1])
        }
    });
});

function createButtonDiv(arr) {
    var buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('id', 'buttonDiv');
    buttonDiv.setAttribute('style', 'padding-left:17px');
    var sp = document.createElement('span');
    sp.setAttribute('style', 'color:black; font-size:12px; margin-left:15px; background-color:#e6e4e4; padding:11px; border-radius:6px');
    sp.innerHTML = 'Choose a course to edit:';
    buttonDiv.append(sp);
    for (var i = 0; i < arr.length; i++) {
        if(isFuhsd && arr[i].indexOf('delete') == -1) 
            buttonDiv.append(createClassButton(arr[i], i + 1, 'tomato'));
    }

    buttonDiv.appendChild(enableFinalCalc());
    return buttonDiv;
}