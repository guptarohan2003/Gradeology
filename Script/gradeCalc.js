$(document).ready(function () {
    var arr = [
        'enabled',
        'class1',
        'class2',
        'class3',
        'class4',
        'class5',
        'class6',
        'class7'
    ];
    chrome.storage.sync.get(arr, function (val) {
        // if (val.enabled == 'true') {
        var btn1 = createButton(val.class1);
        var btn2 = createButton(val.class2);
        var btn3 = createButton(val.class3);
        var btn4 = createButton(val.class4);
        var btn5 = createButton(val.class5);
        var btn6 = createButton(val.class6);
        var btn7 = createButton(val.class7);

        $('#center-top').find('h2').append('<span style="color:white; font-size:12px; margin-left:15px; background-color:DodgerBlue; padding:10px; border-radius: 6px;">Choose the course to edit: </span>');
        $('#center-top').find('h2').append(btn1);
        $('#center-top').find('h2').append(btn2);
        $('#center-top').find('h2').append(btn3);
        $('#center-top').find('h2').append(btn4);
        $('#center-top').find('h2').append(btn5);
        $('#center-top').find('h2').append(btn6);
        $('#center-top').find('h2').append(btn7);

        $('#center-top').find('h2').on("click", function (element) {
            if (element.target.attributes['id']) {
                var classClicked = element.target.attributes['id'].value;
                var coursesNames = [val.class1, val.class2, val.class3, val.class4, val.class5, val.class6, val.class7];

                var courseNum = findCourseClicked(classClicked, coursesNames);

                if (courseNum != -1) {
                    var add = setColorOfButton(element.target);
                    var course = $('.gradebook-course').eq(courseNum - 1);

                    //current semester info
                    var semesterNum = new Date().getMonth() >= 7 ? 1 : 2;
                    var semester = course.find('.period-row').eq(semesterNum - 1);
                    var semesterid = semester[0].attributes['data-id'].value;

                    var realCategory = [];

                    if (add) {

                        // var semesterNum = new Date().getMonth() >= 7 ? 1 : 2;
                        // var semester = course.find('.period-row').eq(semesterNum - 1);
                        // var semesterid = semester[0].attributes['data-id'].value;

                        var categoryNames = [];
                        var categoryWeights = [];
                        var categoryParentId = [];
                        var currentTotalPoints = [];
                        var currentGivenPoints = [];
                        var addedTotalPoints = [];
                        var addedGivenPoints = [];
                        var actualCategory = [];

                        // semester.find('.td-content-wrapper').find('span.rounded-grade')[0].innerHTML = '<span style="background-color:yellow">' + newGrade + '%</span>';
                        // var categoryGradesStr = "";

                        //categories info
                        var categoriesRead = course.find('.category-row');
                        for (var i = 0; i < categoriesRead.length; i++) {
                            var x = categoriesRead.eq(i);
                            var categoryId = x[0].attributes['data-parent-id'].value;
                            if (categoryId == semesterid) {
                                var categoryNameWeightCurrent = x[0].innerText.toString();
                                var name = categoryNameWeightCurrent.substring(0, categoryNameWeightCurrent.indexOf('Category'));
                                var weight = categoryNameWeightCurrent.substring(categoryNameWeightCurrent.indexOf('(') + 1, categoryNameWeightCurrent.indexOf('%'));
                                var parentId = x[0].attributes['data-id'].value;

                                categoryNames.push(name);
                                categoryWeights.push(parseFloat(weight));
                                categoryParentId.push(parentId);
                                currentTotalPoints.push(0);
                                currentGivenPoints.push(0);
                                addedTotalPoints.push(0);
                                addedGivenPoints.push(0);
                                actualCategory.push(x);
                                // console.log()
                                realCategory.push(x.find('span.rounded-grade')[0].innerHTML);
                            }
                        }
                        realCategory.push(semester.find('.td-content-wrapper').find('span.rounded-grade')[0].innerHTML);
                        // console.log(realCategory);

                        getGradeValues(course, currentTotalPoints, currentGivenPoints, categoryParentId, courseNum, false);

                        var inputArea = createInputArea(categoryNames, courseNum);
                        var added = assignmentsDiv(courseNum);
                        course.prepend(inputArea);
                        course.prepend(added);

                        //recalc button handler
                        $('#recalc' + courseNum).click(function (el) {
                            for (var i = 0; i < categoryNames.length; i++) {
                                currentTotalPoints[i] = addedTotalPoints[i];
                                currentGivenPoints[i] = addedGivenPoints[i];
                            }
                            getGradeValues(course, currentTotalPoints, currentGivenPoints, categoryParentId, courseNum, true);

                            var newGrade = calculateGrade(actualCategory, courseNum, semester, 0, 0, 0, categoryWeights, currentGivenPoints, currentTotalPoints, true);
                            var gradeHeader = $('h2#grade' + courseNum);
                            gradeHeader.text("New Grade: " + newGrade);
                        });

                        //hide button handler
                        $('.deleteGiven' + courseNum).click(function (eleme) {
                            eleme.stopPropagation();
                            eleme.stopImmediatePropagation();
                            var divIdOfAssig = eleme.target.attributes['divId'].value;
                            var buttonText = eleme.target.innerHTML;
                            var divStyle = $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value;
                            var hiddenColor = 'background-color:#DCDCDC;';

                            if (buttonText.toString() == "Hide Assignment") {
                                // console.log('in');
                                $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value = hiddenColor + divStyle;
                                eleme.target.innerHTML = "Assignment is Hidden from Grade Calculation";
                            } else {
                                // console.log('no');
                                $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value = divStyle.substring(hiddenColor.length);
                                eleme.target.innerHTML = "Hide Assignment";

                            }
                        });

                        //add assignment button handler
                        $('#addassignment' + courseNum).click(function (el) {
                            var categoryChoosen = $('select#select' + courseNum)[0].options['selectedIndex'];
                            var scoreChoosen = $('input#score' + courseNum)[0].value != '' ? parseInt($('input#score' + courseNum)[0].value) : 0;
                            var totalChoosen = $('input#total' + courseNum)[0].value != '' ? parseInt($('input#total' + courseNum)[0].value) : 0;

                            addedTotalPoints[categoryChoosen] += totalChoosen;
                            addedGivenPoints[categoryChoosen] += scoreChoosen;

                            var newGrade = calculateGrade(actualCategory, courseNum, semester, categoryChoosen, scoreChoosen, totalChoosen, categoryWeights, currentGivenPoints, currentTotalPoints, false);
                            addAssignment(categoryNames[categoryChoosen], scoreChoosen, totalChoosen, courseNum, categoryChoosen, actualCategory);

                            var gradeHeader = $('h2#grade' + courseNum);
                            gradeHeader.text("New Grade: " + newGrade);

                            //delete assignment handler
                            $('.addedItem').click(function (eleme) {
                                eleme.stopPropagation();
                                eleme.stopImmediatePropagation();

                                var score = eleme.target.attributes['score'].value;
                                var total = eleme.target.attributes['total'].value;
                                var category = eleme.target.attributes['categorynum'].value;

                                eleme.target.remove();
                                addedTotalPoints[categoryChoosen] -= totalChoosen;
                                addedGivenPoints[categoryChoosen] -= scoreChoosen;

                                var newGrade = calculateGrade(actualCategory, courseNum, semester, category, -score, -total, categoryWeights, currentGivenPoints, currentTotalPoints, false);
                                gradeHeader.text("New Grade: " + newGrade);
                            });
                        });

                    } else {
                        // remove input
                        course.find('div#input' + courseNum).remove();
                        //remove added text
                        course.find('div#addedAssignments' + courseNum).remove();
                        //remove edit features
                        var itemInputs = course.find('.itemInputs' + courseNum);
                        if (itemInputs.length > 0)
                            itemInputs.remove();

                        course.find('td.grade-column').children().show();

                        //set old semester and category values and remove changed ones
                        semester.find('span.secondary-grade').show();
                        var del = semester.find('span.toBeDeleted' + courseNum);
                        if (del.length > 0)
                            del.remove();

                        var categoriesRead = course.find('.category-row');
                        for (var i = 0; i < categoriesRead.length; i++) {
                            var category = categoriesRead.eq(i);
                            var categoryId = category[0].attributes['data-parent-id'].value;
                            if (categoryId == semesterid) {
                                category.find('span.secondary-grade').show();
                                var del = category.find('span.toBeDeleted' + courseNum);
                                if (del.length > 0)
                                    del.remove();
                            }
                        }
                    }
                }
            }
        });
        // }
    });
});

function getGradeValues(course, currentTotalPoints, currentGivenPoints, categoryParentId, courseNum, recalculate) {
    var published = course.find('.item-row');
    for (var i = 0; i < published.length; i++) {
        // for (var i = 0; i < 1; i++) {
        var x = published.eq(i);
        var itemId = x[0].attributes['data-parent-id'].value;
        // console.log(x);
        for (var j = 0; j < categoryParentId.length; j++) {
            if (categoryParentId[j] == itemId) {

                var itemTotalPoints = 0;
                var itemGivenPoints = 0;
                var iteminfo;

                if (!recalculate) {
                    iteminfo = x.find('.td-content-wrapper').eq(1)[0].innerText;

                    var cut = iteminfo.indexOf('/');
                    if (cut != -1) {
                        var itemTotalPoints = parseFloat(iteminfo.substring(cut + 1));
                        var cut2 = iteminfo.indexOf(' ');
                        if (cut - cut2 != 1)
                            itemGivenPoints = parseFloat(iteminfo.substring(cut2 + 1, cut));
                        else
                            itemGivenPoints = parseFloat(iteminfo.substring(0, cut));
                    }
                } else {
                    // debugger
                    var assigNotHidden = x.find('div#itemInputs' + i)[0].innerText.substring(0, 4) == 'Hide';
                    if (assigNotHidden) {
                        iteminfo = x.find('.itemInputs' + courseNum);
                        itemGivenPoints = parseFloat(iteminfo.find('input#changeGiven-1')[0].value);
                        itemTotalPoints = parseFloat(iteminfo.find('input#changeTotal-1')[0].value);
                    }
                }

                currentTotalPoints[j] += itemTotalPoints;
                currentGivenPoints[j] += itemGivenPoints;

                if (!recalculate) {
                    x.find('td.grade-column').children().hide();
                    //add editing boxes
                    var divX = createEditInputs(itemGivenPoints, courseNum, itemTotalPoints, i);
                    x.find('td.grade-column').append(divX);
                }
            }
        }
    }
}

function createEditInputs(itemGivenPoints, courseNum, itemTotalPoints, i) {
    var divX = document.createElement('div');
    divX.setAttribute('id', 'itemInputs' + i);
    divX.setAttribute('class', 'itemInputs' + courseNum);
    divX.setAttribute('style', 'border-radius:6px; width:500px; padding:17px;float:right');
    inputValueItems(divX, -1, 'changeGiven', 'changeTotal', itemGivenPoints.toString(), itemTotalPoints.toString(), '40px', false);

    var hide = document.createElement('button');
    hide.innerHTML = 'Hide Assignment';
    // hide.setAttribute('id', 'deleteGiven');
    hide.setAttribute('divId', i.toString());
    hide.setAttribute('class', 'deleteGiven' + courseNum);
    hide.setAttribute('style', "margin-left: 10px;margin-right: 10px;border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 20px; background-color:Ivory; color:grey;");
    divX.appendChild(hide);

    divX.append('Original: ' + itemGivenPoints + ' / ' + itemTotalPoints);

    return divX;
}

function calculateGrade(actualCategory, courseNum, semester, categoryChoosen, scoreChoosen, totalChoosen, categoryWeights, currentGivenPoints, currentTotalPoints, recalc) {
    //whole numbers
    if (!recalc) {
        currentGivenPoints[categoryChoosen] = currentGivenPoints[categoryChoosen] + scoreChoosen;
        currentTotalPoints[categoryChoosen] = currentTotalPoints[categoryChoosen] + totalChoosen;
        var newGrade = currentGivenPoints[categoryChoosen] / currentTotalPoints[categoryChoosen] * categoryWeights[categoryChoosen] / 100;
    } else {
        categoryChoosen = -1;
        var newGrade = 0;
    }
    //decimal new category grade;
    for (var i = 0; i < currentGivenPoints.length; i++) {
        if (i != categoryChoosen) {
            newGrade += currentGivenPoints[i] / currentTotalPoints[i] * categoryWeights[i] / 100;
        }
    }

    //fix grade if totalweights isnt 100%
    var totalWeight = 0;
    for (var i = 0; i < categoryWeights.length; i++) {
        totalWeight += categoryWeights[i];
    }
    if (totalWeight != 100) {
        newGrade = newGrade / totalWeight * 100;
    }

    //new percent grade
    newGrade = newGrade * 100;
    newGrade = newGrade.toFixed(2);

    //settings semester and project values on table rows 
    var change = semester.find('span.toBeDeleted' + courseNum);
    if (change.length > 0) {
        semester.find('span.toBeDeleted' + courseNum).text('(' + newGrade + '%)');
    } else {
        var sp = document.createElement('span');
        sp.innerHTML = '(' + newGrade.toString() + '%)';
        sp.setAttribute('style', 'background-color:yellow');
        sp.setAttribute('class', 'toBeDeleted' + courseNum);

        semester.find('span.awarded-grade').append(sp);
        semester.find('span.secondary-grade').hide();
    }

    for (var i = 0; i < actualCategory.length; i++) {
        var categoryGrade = currentGivenPoints[i] / currentTotalPoints[i] * 100;
        var cateString = '(' + categoryGrade.toFixed(2) + '%)';

        var change = actualCategory[i].find('span.toBeDeleted' + courseNum);
        if (change.length > 0) {
            actualCategory[i].find('span.toBeDeleted' + courseNum).text(cateString);
        } else {
            var sp = document.createElement('span');
            sp.innerHTML = cateString;
            sp.setAttribute('style', 'background-color:yellow');
            sp.setAttribute('class', 'toBeDeleted' + courseNum);

            actualCategory[i].find('span.awarded-grade').append(sp);
            actualCategory[i].find('span.secondary-grade').hide();
        }


    }
    $('h2#grade' + courseNum).text("New Grade: " + newGrade);
    //
    
    return newGrade;
}

function addAssignment(category, score, total, courseNum, categoryChoosen, actualCategory) {
    var itemDiv = document.createElement('div');
    itemDiv.setAttribute('class', 'addedItem');

    var assig = document.createElement('p');
    assig.setAttribute('categorynum', categoryChoosen.toString());
    assig.setAttribute('score', score.toString());
    assig.setAttribute('total', total.toString());
    assig.setAttribute('style', 'color:black; font-size:10.5px');
    assig.innerHTML = "- Category: " + category + " &nbsp;&nbsp;Score: " + score + " &nbsp;&nbsp;Total: " + total;

    itemDiv.appendChild(assig);

    // var itemDiv = document.createElement('tr');
    // itemDiv.setAttribute('class', 'report-row item-row is-grade-column addedItem');
    // itemDiv.appendChild(assig);

    var assignmentsDiv = $('div#addedAssignments' + courseNum);
    assignmentsDiv.append(itemDiv);

    // itemDiv.insertAfter(actualCategory[categoryChoosen]);
    // console.log(actualCategory[categoryChoosen]);
    // actualCategory[categoryChoosen].append(itemDiv);
    // actualCategory[categoryChoosen].insertAfter(itemDiv);

}

function assignmentsDiv(courseNum) {
    var added = document.createElement('div');
    added.setAttribute('style', 'width:560px;border-radius: 6px;background-color:#5bc159; padding:6px; display:inline-block; margin-top:-10px');
    added.setAttribute('id', 'addedAssignments' + courseNum);

    var grade = document.createElement('h2');
    grade.setAttribute('id', 'grade' + courseNum);
    grade.setAttribute('style', "font-size:14px; color:white");
    grade.innerHTML = 'New Grade: --';
    added.appendChild(grade);

    var head = document.createElement('h2');
    head.innerHTML = 'Added Assignments: (click anywhere on an added assignment to delete!)';
    head.setAttribute('style', "font-size:11px; color:white");
    added.appendChild(head);

    return added;
}

function createInputArea(categoryNames, courseNum) {
    var div1 = document.createElement('div');
    div1.setAttribute('id', 'input' + courseNum);
    div1.setAttribute('style', 'width:560px;height:40px;border-radius: 6px;background-color:#5bc159; padding:7px 7px 7px 16px; margin-top:2px; margin-bottom:7px');

    categorySelect(div1, categoryNames, courseNum);
    inputValueItems(div1, courseNum, 'score', 'total', ' Score', ' Total', '70px', true);

    var enter = document.createElement('button');
    enter.innerHTML = 'Add Assignment';
    enter.setAttribute('id', 'addassignment' + courseNum);
    enter.setAttribute('style', "border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 20px; background-color:Ivory; color:grey;");
    div1.appendChild(enter);

    var recalc = document.createElement('button');
    recalc.innerHTML = 'Recalculate Grade';
    recalc.setAttribute('id', 'recalc' + courseNum);
    recalc.setAttribute('style', "margin-left: 10px;border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 20px; background-color:Ivory; color:grey;");
    div1.appendChild(recalc);

    return div1;
}

function inputValueItems(parent, courseNum, id1, id2, ph1, ph2, width, adding) {
    var addOrEdit = 'value';
    if (adding) addOrEdit = 'placeholder';
    var score = document.createElement('input');
    score.setAttribute('id', id1 + courseNum);
    score.setAttribute('type', 'number');
    score.setAttribute(addOrEdit, ph1);
    score.setAttribute('style', "font-size:11px; margin-right:10px; border-radius: 5px;width:" + width + "; height: 20px; background-color:Ivory");

    var total = document.createElement('input');
    total.setAttribute('id', id2 + courseNum);
    total.setAttribute('type', 'number');
    total.setAttribute(addOrEdit, ph2);
    total.setAttribute('style', "font-size:11px; margin-right:10px; border-radius: 5px;width:" + width + "; height: 20px; background-color:Ivory");

    parent.appendChild(score);
    parent.appendChild(total);

}

function categorySelect(parent, categoryNames, courseNum) {
    var sl = document.createElement("select");
    sl.setAttribute('id', 'select' + courseNum);
    sl.setAttribute('style', "height:23px; font-size:11px; margin-right:10px; background-color:Ivory; color:Grey");
    for (var i = 0; i < categoryNames.length; i++) {
        var op = document.createElement('option');
        op.value = categoryNames[i];
        op.text = categoryNames[i];
        sl.appendChild(op);
    }

    parent.appendChild(sl);
}

function createButton(id) {
    var button = document.createElement('button');
    button.innerHTML = id;
    button.setAttribute('id', id);
    button.setAttribute('color', 'tomato');
    button.setAttribute('style', 'background-color:#bf0707; color:white; margin-left:10px; font-size:10px; padding:10px; border-radius: 6px;');
    return button;
}

//returns true when need to add calculator portion
function setColorOfButton(ele) {
    // console.log(ele);
    var cut = ele.attributes['style'].value.indexOf(';');
    var othercss = ele.attributes['style'].value.substring(cut);

    if (ele.attributes['color'].value == 'tomato') {
        ele.attributes['color'].value = 'green';
        ele.setAttribute('style', 'background-color:#148e06' + othercss);
        return true;
    } else {
        ele.attributes['color'].value = 'tomato';
        ele.setAttribute('style', 'background-color:#bf0707' + othercss);
        return false;
    }
}

function findCourseClicked(ele, coursesNames) {
    for (var i = 0; i < coursesNames.length; i++) {
        if (coursesNames[i] == ele) {
            return i + 1;
        }
    }
    return -1;
}