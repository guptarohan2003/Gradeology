$(document).ready(function () {
    chrome.storage.sync.get(['enabled'], function (val) {
        if (val.enabled == 'true') {
            //course info
            var courseNum = 0
            var course = $('.gradebook-course').eq(0);

            //semester info
            var semesterNum = new Date().getMonth() >= 7 ? 1 : 2;
            var semester = course.find('.period-row').eq(semesterNum - 1);
            var semesterid = semester[0].attributes['data-id'].value;

            //original grade
            var originalGrade = semester[0].children[1].innerText;
            originalGrade = originalGrade.substring(originalGrade.indexOf('(') + 1, originalGrade.length - 1);

             //create button and final calc div
             $('#center-top').append(createButtonDiv());
             $('#finalGradeDiv').find('div#finalCalc').hide();
             $('#currentGrade')[0].value = originalGrade
             finalCalculatorHandlers();
             
            //add calculator
            calculator(course, courseNum, semester, semesterid, originalGrade);

            //enable class gradeCalc
            $('button.enableCalc').click(function (element) {
                var add = setColorOfButton(element.target, true);

                if (add) {
                    calculator(course, courseNum, semester, semesterid, originalGrade, false)
                } else {
                    removeCalculator(course, courseNum, semester, semesterid)
                    $('#currentGrade')[0].value = originalGrade
                }
            });
        }
    });
});

function createButtonDiv() {
    var buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('style', 'display: inline-flex; margin-left:-10px')

    buttonDiv.append(createClassButton('Disable Grade Calculator', 1, 'green'));
    buttonDiv.appendChild(enableFinalCalc());
    return buttonDiv;
}