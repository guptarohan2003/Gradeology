$(document).ready(function () {
    //course info
    var courseNum = 0
    var course = $('.gradebook-course').eq(0);

    //semester info
    var semesterNum = new Date().getMonth() >= 7 ? 1 : 2;
    var semester = course.find('.period-row').eq(semesterNum - 1);
    var semesterid = semester[0].attributes['data-id'].value;

    //original grade
    var originalGrade = semester[0].children[1].innerText;
    originalGrade = originalGrade.substring(originalGrade.indexOf('(') + 1, originalGrade.indexOf('%') + 1);

    //create button and final calc div
    $('#center-top').append(createButtonDiv());
    //  $('#enableFinalCalc')[0].style['margin-left'] = '26px';
    $('button.enableCalc')[0].style['margin-top'] = '0px';
    $('#currentGrade')[0].value = parseFloat(originalGrade)
    $('#finalGradeDiv').find('div#finalCalc').hide();
    finalCalculatorHandlers();

    //add calculator
    // calculator(course, courseNum, semester, semesterid, originalGrade);

    //enable class gradeCalc
    $('button.enableCalc').click(function (element) {
        var disable = setColorOfButton(element.target, true);

        if (!disable) {
            calculator(course, courseNum, semester, semesterid, originalGrade)
        } else {
            removeCalculator(course, courseNum, semester, semesterid)
            $('#currentGrade')[0].value = parseFloat(originalGrade)
        }
    });
});

function createButtonDiv() {
    var buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('style', 'display: inline-flex; margin-left:-10px')

    buttonDiv.append(createClassButton('Enable Grade Calculator', 1, 'green'));
    buttonDiv.appendChild(enableFinalCalc());
    return buttonDiv;
}