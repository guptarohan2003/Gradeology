$(document).ready(function () {
    setTimeout(function () {
        chrome.storage.sync.get(['alwaysEnable', 'notif'], function (val) {

            //course info
            var courseNum = 0
            var course = $('.gradebook-course').eq(0);

            //semester info
            var semester = getCurrentSemester(course);
            var semesterid = semester[0].attributes['data-id'].value;

            //original grade
            var originalGrade = semester[0].children[1].innerText;
            originalGrade = originalGrade.substring(originalGrade.indexOf('(') + 1, originalGrade.indexOf('%') + 1);

            //create button and final calc div
            $('#center-top').append(createButtonDiv(val.alwaysEnable));
            //  $('#enableFinalCalc')[0].style['margin-left'] = '26px';
            $('button.enableCalc')[0].style['margin-top'] = '0px';
            $('#currentGrade')[0].value = parseFloat(originalGrade)
            $('#finalGradeDiv').find('div#finalCalc').hide();
            finalCalculatorHandlers();

            //add alwaysEnable checkbox
            $(alwaysEnable()).insertAfter($('#buttonDiv'))
            alwaysEnableHandlers();

            //summaryDiv Information
            var summaryDivInf = summaryDivInfo(course);

            //add calculator
            if (val.alwaysEnable) calculator(course, courseNum, semester, semesterid, originalGrade, summaryDivInf);

            //enable class gradeCalc
            $('button.enableCalc').click(function (element) {
                var enable = setColorOfButton(element.target, true);

                if (enable) {
                    calculator(course, courseNum, semester, semesterid, originalGrade, summaryDivInf)
                } else {
                    removeCalculator(course, courseNum, semester, semesterid, summaryDivInf)
                    $('#currentGrade')[0].value = parseFloat(originalGrade)
                }
            });
        });

    }, 500);
});

function createButtonDiv(enableCalculator) {
    var buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('id', 'buttonDiv')
    buttonDiv.setAttribute('style', 'display: inline-flex; margin-left:-10px')

    if (enableCalculator) {
        buttonDiv.append(createClassButton('Disable Grade Calculator', 1, 'green'));

    } else {
        buttonDiv.append(createClassButton('Enable Grade Calculator', 1, 'tomato'));
    }
    buttonDiv.appendChild(enableFinalCalc());

    return buttonDiv;
}