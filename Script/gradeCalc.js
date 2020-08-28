//total number of classes
var numClass = 0;
chrome.storage.sync.get(['numClasses'], function (val) {
    numClass = val.numClasses
})

$(document).ready(function () {
    var arr = ['enabled']
    for (var i = 0; i < numClass; i++) {
        arr.push('class' + i)
    }
    chrome.storage.sync.get(arr, function (val) {
        if (val.enabled == 'true') {
            var class_names = [];
            for (var i = 0; i < numClass; i++) {
                class_names.push(val['class' + i])
            }

            //create button and final calc div
            $('#center-top').append(createButtonDiv(class_names));
            $('#finalGradeDiv').find('div#finalCalc').hide();
            finalCalculatorHandlers();
            $('#enableFinalCalc')[0].style['margin-left'] = '26px';
            $('#enableFinalCalc')[0].style['margin-top'] = '7px';

            //enable class gradeCalc
            $('button.enableCalc').click(function (element) {
                //course info
                var courseNum = element.target.attributes['courseNum'].value;
                var course = $('.gradebook-course').eq(courseNum - 1);

                //current semester info
                var semesterNum = new Date().getMonth() >= 7 ? 1 : 2;
                var semester = course.find('.period-row').eq(semesterNum - 1);
                var semesterid = semester[0].attributes['data-id'].value;
                
                //original grade
                var originalGrade = semester[0].children[1].innerText;
                originalGrade = originalGrade.substring(originalGrade.indexOf('(') + 1, originalGrade.length - 1);
                
                var add = setColorOfButton(element.target, false);
                if (add) {
                    calculator(course, courseNum, semester, semesterid, originalGrade, true)
                } else {
                    removeCalculator(course, courseNum, semester, semesterid)
                }
            });
        }
    });
});

function createButtonDiv(arr) {
    var buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('id', 'buttonDiv');
    buttonDiv.setAttribute('style', 'padding-left:20px');
    var sp = document.createElement('span');
    sp.setAttribute('style', 'color:white; font-size:12px; margin-left:15px; background-color:DodgerBlue; padding:10px; border-radius:6px');
    sp.innerHTML = 'Choose the course to edit:';
    buttonDiv.append(sp);
    for (var i = 0; i < numClass; i++) {
        buttonDiv.append(createClassButton(arr[i], i + 1, 'tomato'));
    }

    buttonDiv.appendChild(enableFinalCalc());
    return buttonDiv;
}