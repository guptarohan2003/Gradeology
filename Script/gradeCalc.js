$(document).ready(function () {
    chrome.storage.sync.get(['enabled', 'class1', 'class2', 'class3', 'class4', 'class5', 'class6', 'class7'], function (val) {
        if (val.enabled == 'true') {
            var buttonDiv = createButtonDiv(val.class1, val.class2, val.class3, val.class4, val.class5, val.class6, val.class7);
            $('#center-top').append(buttonDiv);

            //enable final Calc Handler
            $('button#enableFinalCalc').click(function (element) {
                var str = element.target.innerHTML;
                if (str == "Enable Final Calculator") {
                    $('#finalGradeDiv').append(finalCalcDiv());
                    element.target.innerHTML = "Disable Final Calculator";
                    //calculate final grades handler
                    $('button#calcFinalGrade').click(function (ele) {
                        var currentG = ele.target.parentElement.children[0].valueAsNumber;
                        var weight = ele.target.parentElement.children[1].valueAsNumber;
                        var desiredG = ele.target.parentElement.children[2].valueAsNumber;
                        var neededGrade = (desiredG - currentG * (100 - weight) / 100) * 100 / weight;
                        ele.target.parentElement.children[4].innerHTML = 'Grade Needed: ' + neededGrade.toFixed(2) + '%';
                    });
                } else {
                    $('#finalGradeDiv').find('div#finalCalc').remove();
                    element.target.innerHTML = "Enable Final Calculator";
                }
            });

            //enable class gradeCalc
            $('button.enableCalc').click(function (element) {
                var courseNum = element.target.attributes['courseNum'].value;

                var add = setColorOfButton(element.target);
                var course = $('.gradebook-course').eq(courseNum - 1);

                //current semester info
                var semesterNum = new Date().getMonth() >= 7 ? 1 : 2;
                var semester = course.find('.period-row').eq(semesterNum - 1);
                var semesterid = semester[0].attributes['data-id'].value;

                if (add) {
                    var categoryNames = [];
                    var categoryWeights = [];
                    var categoryParentId = [];
                    var currentTotalPoints = [];
                    var currentGivenPoints = [];
                    var addedTotalPoints = [];
                    var addedGivenPoints = [];
                    var actualCategory = [];

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
                        }
                    }

                    getGradeValues(course, currentTotalPoints, currentGivenPoints, categoryParentId, courseNum);

                    course.prepend(createInputArea(categoryNames, courseNum));
                    course.prepend(assignmentsDiv(courseNum));

                    //--------------------HANDLERS--------------------------//

                    //hide button handler
                    $('.deleteGiven' + courseNum).click(function (eleme) {
                        eleme.stopPropagation();
                        eleme.stopImmediatePropagation();
                        var divIdOfAssig = eleme.target.attributes['divId'].value;
                        var divStyle = $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value;

                        var hiddenColor = 'background-color:#DCDCDC;';
                        var isHidden = eleme.target.attributes['hide'].value == 'no' ? false : true;
                        var hideGiven = $('div#itemInputs' + divIdOfAssig).find('input#changeGiven'+courseNum)[0].valueAsNumber;
                        var hideTotal = $('div#itemInputs' + divIdOfAssig).find('input#changeTotal'+courseNum)[0].valueAsNumber;
                        var cat = eleme.target.attributes['cat'].value;

                        if (!isHidden) {
                            $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value = hiddenColor + divStyle;
                            eleme.target.innerHTML = "Include Assignment in Calculation";
                            eleme.target.attributes['hide'].value = 'yes';

                            currentGivenPoints[cat] -= hideGiven;
                            currentTotalPoints[cat] -= hideTotal;
                        } else {
                            $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value = divStyle.substring(hiddenColor.length);
                            eleme.target.innerHTML = "Exclude Assignment from Calculation";
                            eleme.target.attributes['hide'].value = 'no'

                            currentGivenPoints[cat] += hideGiven;
                            currentTotalPoints[cat] += hideTotal;
                        }
                        calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints);
                    });

                    //add assignment button handler
                    $('#addassignment' + courseNum).click(function () {
                        var categoryChoosen = $('select#select' + courseNum)[0].options['selectedIndex'];
                        var scoreChoosen = $('input#score' + courseNum)[0].value != '' ? parseInt($('input#score' + courseNum)[0].value) : 0;
                        var totalChoosen = $('input#total' + courseNum)[0].value != '' ? parseInt($('input#total' + courseNum)[0].value) : 0;

                        addedTotalPoints[categoryChoosen] += totalChoosen;
                        addedGivenPoints[categoryChoosen] += scoreChoosen;

                        calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints);
                        addAssignment(categoryNames[categoryChoosen], scoreChoosen, totalChoosen, courseNum, categoryChoosen, semester);

                        //changed score in added assignment handler
                        $('input#changeGivenAdd'+courseNum).change(function (element) {
                            var change = element.target.valueAsNumber - element.target.attributes['previousVal'].value;
                            element.target.attributes['previousVal'].value = element.target.valueAsNumber
                            var cat = element.target.attributes['cat'].value;

                            addedGivenPoints[cat] += change;
                            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints);
                        });
                        //changed total in added assignment handler
                        $('input#changeTotalAdd'+courseNum).change(function (element) {
                            var change = element.target.valueAsNumber - element.target.attributes['previousVal'].value;
                            element.target.attributes['previousVal'].value = element.target.valueAsNumber
                            var cat = element.target.attributes['cat'].value;

                            addedTotalPoints[cat] += change;
                            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints);
                        });

                        //delete added assignment handler
                        $('button#deleteAdded' + courseNum).click(function (eleme) {
                            eleme.stopPropagation();
                            eleme.stopImmediatePropagation();

                            // debugger
                            var score = eleme.target.parentElement.children[1].value
                            var total = eleme.target.parentElement.children[2].value
                            var category = eleme.target.attributes['categorynum'].value;

                            eleme.target.parentElement.remove();
                            addedGivenPoints[category] -= score;
                            addedTotalPoints[category] -= total;

                            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints);
                        });
                    });

                    // change given score handler
                    $('input#changeGiven'+courseNum).change(function (element) {
                        var currentNum = element.target.valueAsNumber;
                        var change = element.target.valueAsNumber - element.target.attributes['previousVal'].value;
                        // element.target.attributes['previousVal'].value = element.target.valueAsNumber
                        var numAssig = element.target.attributes['divid'].value;
                        var cat = element.target.attributes['cat'].value;
                        var hidden = course.find('#itemInputs' + numAssig).find('button.deleteGiven' + courseNum)[0].attributes['hide'].value == 'no' ? false : true;

                        //add original text when changed
                        var parentDiv = course.find('#itemInputs' + numAssig);
                        var origGiven = parentDiv[0].attributes['originalGiven'].value;
                        var origTotal = parentDiv[0].attributes['originalTotal'].value;
                        var currentTotal = parentDiv.find('input#changeTotal'+courseNum)[0].attributes['previousVal'].value;

                        var findSpan = parentDiv.find('span#originalStr');
                        if (findSpan.length == 0 && currentNum != origGiven) {
                            var orig = document.createElement('span');
                            orig.setAttribute('id', 'originalStr');
                            orig.innerHTML = 'Original: ' + origGiven + ' / ' + origTotal;
                            parentDiv.append(orig);
                        } else {
                            if (currentNum == origGiven && currentTotal == origTotal)
                                findSpan.remove();
                        }

                        if (!hidden) {
                            element.target.attributes['previousVal'].value = element.target.valueAsNumber;
                            currentGivenPoints[cat] += change;
                            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints);
                        }
                    });

                    //change given total handler
                    $('input#changeTotal'+courseNum).change(function (element) {
                        var currentNum = element.target.valueAsNumber;
                        var change = element.target.valueAsNumber - element.target.attributes['previousVal'].value;
                        // element.target.attributes['previousVal'].value = element.target.valueAsNumber
                        var numAssig = element.target.attributes['divId'].value;
                        var cat = element.target.attributes['cat'].value;
                        var hidden = course.find('#itemInputs' + numAssig).find('button.deleteGiven' + courseNum)[0].attributes['hide'].value == 'no' ? false : true;

                        //add original text when changed
                        var parentDiv = course.find('#itemInputs' + numAssig);
                        var origTotal = parentDiv[0].attributes['originalTotal'].value;
                        var currentGiven = parentDiv.find('input#changeGiven'+courseNum)[0].attributes['previousVal'].value;
                        var origGiven = parentDiv[0].attributes['originalGiven'].value;
                        var findSpan = parentDiv.find('span#originalStr');

                        if (findSpan.length == 0 && currentNum != origTotal) {
                            var orig = document.createElement('span');
                            orig.setAttribute('id', 'originalStr');
                            orig.innerHTML = 'Original: ' + origGiven + ' / ' + origTotal;
                            parentDiv.append(orig);
                        } else {
                            if (currentNum == origTotal && currentGiven == origGiven)
                                findSpan.remove();
                        }

                        if (!hidden) {
                            element.target.attributes['previousVal'].value = element.target.valueAsNumber;
                            currentTotalPoints[cat] += change;
                            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints);
                        }
                    });

                } else {
                    //-----------------DELETE ADDED DIVS------------------//

                    // remove input area
                    course.find('div#input' + courseNum).remove();

                    //remove added text -top most div
                    course.find('div#addedAssignments' + courseNum).remove();

                    //remove edit features for each publish assig
                    var itemInputs = course.find('.itemInputs' + courseNum);
                    if (itemInputs.length > 0)
                        itemInputs.remove();

                    //show old gradebook
                    course.find('td.grade-column').children().show();

                    //set old semester and category values and remove changed ones
                    semester.find('span.secondary-grade').show();
                    semester.find('span.alpha-grade').show();
                    var del = semester.find('span.toBeDeleted' + courseNum);
                    if (del.length > 0) {
                        del.remove();

                        var categoriesRead = course.find('.category-row');
                        for (var i = 0; i < categoriesRead.length; i++) {
                            var category = categoriesRead.eq(i);
                            var categoryId = category[0].attributes['data-parent-id'].value;
                            if (categoryId == semesterid) {
                                category.find('span.secondary-grade').show();
                                category.find('span.alpha-grade').show();
                                category.find('span.toBeDeleted' + courseNum).remove();
                            }
                        }
                    }
                    
                    //remove added Assignment
                    var addedAssigs = course.find('.addedItem'+courseNum);
                    if(addedAssigs.length > 0) addedAssigs.remove();
                }
            });
        }
    });
});

function getGradeValues(course, currentTotalPoints, currentGivenPoints, categoryParentId, courseNum) { 
    for (var j = 0; j < categoryParentId.length; j++) {
        var published = course.find('.item-row');
        
        for (var i = 0; i < published.length; i++) {
            var x = published.eq(i);

            var itemId = x[0].attributes['data-parent-id'].value;
            if (categoryParentId[j] == itemId) {

                var itemTotalPoints = 0;
                var itemGivenPoints = 0;
                var iteminfo = x.find('.td-content-wrapper').eq(1)[0].innerText;

                var cut = iteminfo.indexOf('/');
                if (cut != -1) {
                    var itemTotalPoints = parseFloat(iteminfo.substring(cut + 1));
                    var cut2 = iteminfo.indexOf(' ');
                    if (cut - cut2 != 1)
                        itemGivenPoints = parseFloat(iteminfo.substring(cut2 + 1, cut));
                    else
                        itemGivenPoints = parseFloat(iteminfo.substring(0, cut));
                }

                currentTotalPoints[j] += itemTotalPoints;
                currentGivenPoints[j] += itemGivenPoints;

                x.find('td.grade-column').children().hide();

                //add editing boxes
                var divX = createEditInputs(itemGivenPoints, courseNum, itemTotalPoints, i, j);

                x.find('td.grade-column').append(divX);
            }
        }
    }
}

function createEditInputs(itemGivenPoints, courseNum, itemTotalPoints, i, j) {
    var divX = document.createElement('div');
    divX.setAttribute('id', 'itemInputs' + i);
    divX.setAttribute('class', 'itemInputs' + courseNum);
    divX.setAttribute('style', 'border-radius:6px; width:450px; padding:17px;float:right');
    divX.setAttribute('originalGiven', itemGivenPoints);
    divX.setAttribute('originalTotal', itemTotalPoints);

    inputValueItems(divX, courseNum, 'changeGiven', 'changeTotal', itemGivenPoints.toString(), itemTotalPoints.toString(), '40px', false, j, i);

    var hide = document.createElement('button');
    hide.innerHTML = 'Exclude Assignment from Calculation';
    hide.setAttribute('hide', 'no');
    hide.setAttribute('cat', j.toString());
    hide.setAttribute('divId', i.toString());
    hide.setAttribute('class', 'deleteGiven' + courseNum);
    hide.setAttribute('style', "margin-left: 10px;margin-right: 10px;border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 20px; background-color:Ivory; color:grey;");
    divX.appendChild(hide);

    return divX;
}

function calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints) {
    var newGrade = 0;
    //check if category has 0 / 0 points
    var tempCategoryWeights = [];
    for (var i = 0; i < categoryWeights.length; i++) {
        tempCategoryWeights.push(categoryWeights[i]);
    }

    //decimal new category grade;
    for (var i = 0; i < currentGivenPoints.length; i++) {
        var total = currentTotalPoints[i] + addedTotalPoints[i];
        if (total != 0)
            newGrade += (currentGivenPoints[i] + addedGivenPoints[i]) / total * categoryWeights[i] / 100;
        else
            tempCategoryWeights[i] = 0;
    }

    //fix grade if totalweights isnt 100%
    var totalWeight = 0;
    for (var i = 0; i < categoryWeights.length; i++) {
        totalWeight += tempCategoryWeights[i];
    }
    if (totalWeight != 100) {
        newGrade = newGrade / totalWeight * 100;
    }

    //new percent grade
    newGrade = newGrade * 100;
    newGrade = newGrade.toFixed(2);

    //set semester grade value
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
        semester.find('span.alpha-grade').hide();

    }

    //setting category grade values
    for (var i = 0; i < actualCategory.length; i++) {
        var categoryGrade = 0;
        if (tempCategoryWeights[i] != 0)
            categoryGrade = (currentGivenPoints[i] + addedGivenPoints[i]) / (currentTotalPoints[i] + addedTotalPoints[i]) * 100;

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
            actualCategory[i].find('span.alpha-grade').hide();
        }
    }

    //set grade header value
    $('h2#grade' + courseNum).text("New Grade: " + newGrade);
}

function addAssignment(category, score, total, courseNum, categoryChoosen, semester) {
    var itemDiv = document.createElement('div');
    itemDiv.setAttribute('class', 'addedItem'+courseNum);
    itemDiv.setAttribute('style', 'width:460px; padding:10px;');

    var assig = document.createElement('span');
    assig.setAttribute('style', 'color:black; font-size:11px; margin-left:20px; margin-right:30px;color:#e60f0f');
    assig.innerHTML = "*** Gradeology Assignment ***";

    var cate = document.createElement('span');
    cate.setAttribute('style', 'color:black; font-size:11px; margin-left:30px; margin-right:30px;color:#e60f0f');
    cate.innerHTML = "Category: <i>" + category;

    var del = document.createElement('button');
    del.innerHTML = 'Delete Assignment';
    del.setAttribute('categorynum', categoryChoosen.toString());
    del.setAttribute('id', 'deleteAdded' + courseNum);
    del.setAttribute('style', "margin-left: 10px;border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 20px; background-color:Ivory; color:grey;");

    itemDiv.append(assig);
    inputValueItems(itemDiv, courseNum, 'changeGivenAdd', 'changeTotalAdd', score, total, '40px', false, categoryChoosen.toString(), 0);
    itemDiv.append(del);
    itemDiv.append(cate);

    semester.after(itemDiv);
}

function assignmentsDiv(courseNum) {
    var added = document.createElement('div');
    added.setAttribute('style', 'width:420px;border-radius: 6px;background-color:#ec0b0b; padding:6px; display:inline-block; margin-top:-10px');
    added.setAttribute('id', 'addedAssignments' + courseNum);

    var grade = document.createElement('h2');
    grade.setAttribute('id', 'grade' + courseNum);
    grade.setAttribute('style', "font-size:14px; color:white");
    grade.innerHTML = 'New Grade: --';
    added.appendChild(grade);

    return added;
}

function createInputArea(categoryNames, courseNum) {
    var div1 = document.createElement('div');
    div1.setAttribute('id', 'input' + courseNum);
    div1.setAttribute('style', 'width:420px;height:40px;border-radius: 6px;background-color:#ec0b0b; padding:7px 7px 7px 16px; margin-top:2px; margin-bottom:7px');

    categorySelect(div1, categoryNames, courseNum);
    inputValueItems(div1, courseNum, 'score', 'total', ' Score', ' Total', '53px', true, 0, 0);

    var enter = document.createElement('button');
    enter.innerHTML = 'Add Assignment';
    enter.setAttribute('id', 'addassignment' + courseNum);
    enter.setAttribute('style', "border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 20px; background-color:Ivory; color:grey;");
    div1.appendChild(enter);

    return div1;
}

function inputValueItems(parent, courseNum, id1, id2, ph1, ph2, width, adding, j, i) {
    var addOrEdit = 'value';
    if (adding) addOrEdit = 'placeholder';

    var score = document.createElement('input');
    score.setAttribute('id', id1 + courseNum);
    if (!adding) score.setAttribute('cat', j.toString());
    if (!adding) score.setAttribute('divId', i.toString())
    if (!adding) score.setAttribute('previousVal', ph1);
    score.setAttribute('type', 'number');
    score.setAttribute(addOrEdit, ph1);
    score.setAttribute('style', "padding-left:5px;font-size:11px; margin-right:10px; border-radius: 5px;width:" + width + "; height: 20px; background-color:Ivory");

    var total = document.createElement('input');
    total.setAttribute('id', id2 + courseNum);
    if (!adding) total.setAttribute('cat', j.toString());
    if (!adding) total.setAttribute('divId', i.toString())
    if (!adding) total.setAttribute('previousVal', ph2);
    total.setAttribute('type', 'number');
    total.setAttribute(addOrEdit, ph2);
    total.setAttribute('style', "padding-left:5px;font-size:11px; margin-right:10px; border-radius: 5px;width:" + width + "; height: 20px; background-color:Ivory");

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

function createButton(id, num) {
    var button = document.createElement('button');
    button.innerHTML = id;
    button.setAttribute('id', id);
    button.setAttribute('class', 'enableCalc');
    button.setAttribute('courseNum', num.toString());
    button.setAttribute('color', 'tomato');
    button.setAttribute('style', 'background-color:#f10505; color:white; margin-left:10px; font-size:10px; padding:10px; border-radius: 6px;');
    return button;
}

function setColorOfButton(ele) {
    var cut = ele.attributes['style'].value.indexOf(';');
    var othercss = ele.attributes['style'].value.substring(cut);

    if (ele.attributes['color'].value == 'tomato') {
        ele.attributes['color'].value = 'green';
        ele.setAttribute('style', 'background-color:#00b700' + othercss);
        return true;
    } else {
        ele.attributes['color'].value = 'tomato';
        ele.setAttribute('style', 'background-color:#f10505' + othercss);
        return false;
    }
}

function enableFinalCalc() {
    var div = document.createElement('div');
    div.setAttribute('id', 'finalGradeDiv');
    div.setAttribute('style', 'padding-top:8px; padding-left:85px');
    var enableCalc = document.createElement('button');
    enableCalc.innerHTML = 'Enable Final Calculator';
    enableCalc.setAttribute('id', 'enableFinalCalc');
    enableCalc.setAttribute('color', 'tomato');
    enableCalc.setAttribute('style', 'background-color:#7d07c7; color:white; margin-left:10px; font-size:10px; padding:10px; border-radius: 6px;');
    div.appendChild(enableCalc);
    return div;
}

function finalCalcDiv() {
    var div = document.createElement('div');
    div.setAttribute('id', 'finalCalc');
    div.setAttribute('style', 'display:inline');

    var current = document.createElement('input');
    current.setAttribute('placeholder', "Current Grade (%)");
    current.setAttribute('type', 'number');
    current.setAttribute('id', 'currentGrade');
    current.setAttribute('style', "padding-left:5px;font-size:11px; margin-left:10px; border-radius: 5px;width:123px; height: 20px; background-color:Ivory");

    var weight = document.createElement('input');
    weight.setAttribute('placeholder', "Final Weightage (%)");
    weight.setAttribute('type', 'number');
    weight.setAttribute('id', 'finalWeight');
    weight.setAttribute('style', 'margin-left:10px');
    weight.setAttribute('style', "padding-left:5px;font-size:11px; margin-left:10px; border-radius: 5px;width:123px; height: 20px; background-color:Ivory");

    var desired = document.createElement('input');
    desired.setAttribute('placeholder', "Desired Grade (%)");
    desired.setAttribute('type', 'number');
    desired.setAttribute('id', 'desiredGrade');
    desired.setAttribute('style', 'margin-left:10px');
    desired.setAttribute('style', "padding-left:5px;font-size:11px; margin-left:10px; border-radius: 5px;width:123px; height: 20px; background-color:Ivory");

    var finalButton = document.createElement('button');
    finalButton.innerHTML = 'Calculate';
    finalButton.setAttribute('id', 'calcFinalGrade');
    finalButton.setAttribute('color', 'tomato');
    finalButton.setAttribute('style', "margin-left: 10px;margin-left: 10px;border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 25px; width:75px;background-color:#7d07c7; color:white");

    var sp = document.createElement('span');
    sp.setAttribute('style', 'width:70px; height:24px; color:white; font-size:12px; margin-left:15px; background-color:#7d07c7; padding:10px; border-radius:6px');
    sp.innerHTML = 'Grade Needed: ';

    div.appendChild(current);
    div.appendChild(weight);
    div.appendChild(desired);
    div.appendChild(finalButton);
    div.appendChild(sp);

    return div;
}

function createButtonDiv(class1, class2, class3, class4, class5, class6, class7) {
    var buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('id', 'buttonDiv');
    buttonDiv.setAttribute('style', 'padding-left:20px');
    var sp = document.createElement('span');
    sp.setAttribute('style', 'color:white; font-size:12px; margin-left:15px; background-color:DodgerBlue; padding:10px; border-radius:6px');
    sp.innerHTML = 'Choose the course to edit:';
    buttonDiv.append(sp);
    buttonDiv.append(createButton(class1, 1));
    buttonDiv.append(createButton(class2, 2));
    buttonDiv.append(createButton(class3, 3));
    buttonDiv.append(createButton(class4, 4));
    buttonDiv.append(createButton(class5, 5));
    buttonDiv.append(createButton(class6, 6));
    buttonDiv.append(createButton(class7, 7));
    buttonDiv.appendChild(enableFinalCalc());

    return buttonDiv;
}