$(document).ready(function () {
    var courses = $('.gradebook-course');

    var class_names = [];
    for (var i = 0; i < courses.length; i++) {
        var courseName = courses[i].innerText;
        courseName = courseName.substring(0, courseName.lastIndexOf(':'))
        if (courseName.length - 6 > 5) courseName = courseName.substring(0, courseName.length - 6)
        class_names.push(courseName)
    }

    //create button and final calc div
    $('#center-top').append(createButtonDiv(class_names));
    $('#finalGradeDiv').find('div#finalCalc').hide();
    finalCalculatorHandlers();
    $('#enableFinalCalc')[0].style['margin-left'] = '26px';
    $('#enableFinalCalc')[0].style['margin-top'] = '7px';

    $('button.enableCalc').click(function (element) {
        //course info
        var courseNum = element.target.attributes['courseNum'].value;
        var course = courses.eq(courseNum - 1);

        //current semester info
        var semesterNum = new Date().getMonth() >= 7 ? 1 : 2;
        var semester = course.find('.period-row').eq(semesterNum - 1);
        var semesterid = semester[0].attributes['data-id'].value;

        //original grade
        var originalGrade = semester[0].children[1].innerText;
        originalGrade = originalGrade.substring(originalGrade.indexOf('(') + 1, originalGrade.indexOf('%') + 1);

        var add = setColorOfButton(element.target, false);
        if (add) {
            course.find('.gradebook-course-grades')[0].style['display'] = 'block'
            calculator(course, courseNum, semester, semesterid, originalGrade)
            $('#input' + courseNum)[0].style['margin-bottom'] = '7px';
        } else {
            course.find('.gradebook-course-grades')[0].style['display'] = 'none'
            removeCalculator(course, courseNum, semester, semesterid)
        }
    });
});

function createButtonDiv(arr) {
    var buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('id', 'buttonDiv');
    buttonDiv.setAttribute('style', 'padding-left:17px');
    var sp = document.createElement('span');
    sp.setAttribute('style', 'color:white; font-size:12px; margin-left:15px; background-color:DodgerBlue; padding:10px; border-radius:6px');
    sp.innerHTML = 'Choose the course to edit:';
    buttonDiv.append(sp);
    for (var i = 0; i < arr.length; i++) {
        buttonDiv.append(createClassButton(arr[i], i + 1, 'tomato'));
    }

    buttonDiv.appendChild(enableFinalCalc());
    return buttonDiv;
}