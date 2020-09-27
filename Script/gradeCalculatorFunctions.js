function calculator(course, courseNum, semester, semesterid, originalGrade, summaryDivInfo) {
    var categoryNames = [];
    var categoryWeights = [];
    var categoryParentId = [];
    var currentTotalPoints = [];
    var currentGivenPoints = [];
    var addedTotalPoints = [];
    var addedGivenPoints = [];
    var actualCategory = [];
    var originalGrades = [];
    originalGrades.push(parseFloat(originalGrade));

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

            var originalCategoryGrade = categoryNameWeightCurrent.indexOf("—");
            if (originalCategoryGrade == -1)
                originalCategoryGrade = categoryNameWeightCurrent.substring(categoryNameWeightCurrent.lastIndexOf('(') + 1, categoryNameWeightCurrent.lastIndexOf('%'))
            else
                originalCategoryGrade = 0

            categoryNames.push(name);
            categoryWeights.push(isNaN(parseFloat(weight)) ? 100 : parseFloat(weight));
            categoryParentId.push(parentId);
            currentTotalPoints.push(0);
            currentGivenPoints.push(0);
            addedTotalPoints.push(0);
            addedGivenPoints.push(0);
            actualCategory.push(x);
            originalGrades.push(parseFloat(originalCategoryGrade));
        }
    }

    getGradeValues(course, currentTotalPoints, currentGivenPoints, categoryParentId, courseNum);

    course.prepend(createInputArea(categoryNames, courseNum));
    course.prepend(originalGradeHeader(courseNum, originalGrade));
    //--------------------HANDLERS--------------------------//

    //hide button handler
    $('.deleteGiven' + courseNum).click(function (eleme) {
        eleme.stopPropagation();
        eleme.stopImmediatePropagation();
        var divIdOfAssig = eleme.target.attributes['divId'].value;
        var divStyle = $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value;

        var hiddenColor = 'background-color:#DCDCDC;';
        var isHidden = eleme.target.attributes['hide'].value != 'no';
        var hideGiven = $('div#itemInputs' + divIdOfAssig).find('input#changeGiven' + courseNum)[0].valueAsNumber;
        var hideTotal = $('div#itemInputs' + divIdOfAssig).find('input#changeTotal' + courseNum)[0].valueAsNumber;
        var cat = eleme.target.attributes['cat'].value;

        if (!isHidden) {
            $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value = hiddenColor + divStyle;
            eleme.target.innerHTML = "Include Assignment";
            eleme.target.attributes['hide'].value = 'yes';

            currentGivenPoints[cat] -= hideGiven;
            currentTotalPoints[cat] -= hideTotal;
        } else {
            $('div#itemInputs' + divIdOfAssig)[0].attributes['style'].value = divStyle.substring(hiddenColor.length);
            eleme.target.innerHTML = "Exclude Assignment";
            eleme.target.attributes['hide'].value = 'no'

            currentGivenPoints[cat] += hideGiven;
            currentTotalPoints[cat] += hideTotal;
        }
        calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints, cat, summaryDivInfo, originalGrades);
    });

    //add assignment button handler
    $('#addassignment' + courseNum).click(function () {
        var categoryChoosen = $('select#select' + courseNum)[0].options['selectedIndex'];
        var scoreChoosen = $('input#score' + courseNum)[0].value != '' ? parseFloat($('input#score' + courseNum)[0].value) : 0;
        var totalChoosen = $('input#total' + courseNum)[0].value != '' ? parseFloat($('input#total' + courseNum)[0].value) : 0;

        addedTotalPoints[categoryChoosen] += totalChoosen;
        addedGivenPoints[categoryChoosen] += scoreChoosen;

        calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints, categoryChoosen, summaryDivInfo, originalGrades);
        addAssignment(categoryNames[categoryChoosen], scoreChoosen, totalChoosen, courseNum, categoryChoosen, semester);

        //changed score in added assignment handler
        $('input#changeGivenAdd' + courseNum).change(function (element) {
            if (element.target.value == '') element.target.value = 0
            // element.target.valueAsNumber = element.target.value == '' ? 0 : element.target.valueAsNumber;
            var change = element.target.valueAsNumber - element.target.attributes['previousVal'].value;
            element.target.attributes['previousVal'].value = element.target.valueAsNumber
            var cat = element.target.attributes['cat'].value;

            addedGivenPoints[cat] += change;
            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints, cat, summaryDivInfo, originalGrades);
        });
        //changed total in added assignment handler
        $('input#changeTotalAdd' + courseNum).change(function (element) {
            if (element.target.value == '') element.target.value = 0
            var change = element.target.valueAsNumber - element.target.attributes['previousVal'].value;
            element.target.attributes['previousVal'].value = element.target.valueAsNumber
            var cat = element.target.attributes['cat'].value;

            addedTotalPoints[cat] += change;
            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints, cat, summaryDivInfo, originalGrades);
        });

        //delete added assignment handler
        $('button#deleteAdded' + courseNum).click(function (eleme) {
            eleme.stopPropagation();
            eleme.stopImmediatePropagation();

            var score = eleme.target.parentElement.children[1].value
            var total = eleme.target.parentElement.children[2].value
            var category = eleme.target.attributes['categorynum'].value;

            eleme.target.parentElement.remove();
            addedGivenPoints[category] -= score;
            addedTotalPoints[category] -= total;

            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints, category, summaryDivInfo, originalGrades);
        });
    });

    // change given score handler
    $('input#changeGiven' + courseNum).change(function (element) {
        if (element.target.value == '') element.target.value = 0
        var currentNum = element.target.valueAsNumber;
        var change = element.target.valueAsNumber - element.target.attributes['previousVal'].value;
        element.target.attributes['previousVal'].value = element.target.valueAsNumber
        var numAssig = element.target.attributes['divid'].value;
        var cat = element.target.attributes['cat'].value;
        var hidden = course.find('#itemInputs' + numAssig).find('button.deleteGiven' + courseNum)[0].attributes['hide'].value != 'no';

        //add original text when changed
        var parentDiv = course.find('#itemInputs' + numAssig);
        var origGiven = parentDiv[0].attributes['originalGiven'].value;
        var origTotal = parentDiv[0].attributes['originalTotal'].value;
        var currentTotal = parentDiv.find('input#changeTotal' + courseNum)[0].attributes['previousVal'].value;
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
            currentGivenPoints[cat] += change;
            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints, cat, summaryDivInfo, originalGrades);
        }

    });

    //change given total handler
    $('input#changeTotal' + courseNum).change(function (element) {
        if (element.target.value == '') element.target.value = 0
        var currentNum = element.target.valueAsNumber;
        var change = element.target.valueAsNumber - element.target.attributes['previousVal'].value;
        element.target.attributes['previousVal'].value = element.target.valueAsNumber
        var numAssig = element.target.attributes['divId'].value;
        var cat = element.target.attributes['cat'].value;
        var hidden = course.find('#itemInputs' + numAssig).find('button.deleteGiven' + courseNum)[0].attributes['hide'].value != 'no';

        //add original text when changed
        var parentDiv = course.find('#itemInputs' + numAssig);
        var origGiven = parentDiv[0].attributes['originalGiven'].value;
        var origTotal = parentDiv[0].attributes['originalTotal'].value;
        var currentGiven = parentDiv.find('input#changeGiven' + courseNum)[0].attributes['previousVal'].value;
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
            currentTotalPoints[cat] += change;
            calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints, cat, summaryDivInfo, originalGrades);
        }

    });
}

function removeCalculator(course, courseNum, semester, semesterid, summaryDivInfo) {
    //-----------------DELETE ADDED DIVS------------------//

    // remove input area
    course.find('div#input' + courseNum).remove();

    //remove added text -top most div
    course.find('div#originalGradeDiv' + courseNum).remove();

    //remove edit features for each publish assig
    var itemInputs = course.find('.itemInputs' + courseNum);
    if (itemInputs.length > 0)
        itemInputs.remove();

    //show old gradebook
    course.find('td.grade-column').children().show();

    //set old semester and category values and remove changed ones
    var span = semester.find('span.awarded-grade')
    if (span.length > 0) {
        span.find('span.numeric-grade').show();
    } else {
        span = semester.find('span.no-grade')
        span.show();
    }
    //show semester alpha grade
    var alpha = semester.find('span.alpha-grade')
    if (alpha.length > 0) alpha.show();

    var del = semester.find('span.toBeDeleted' + courseNum);
    if (del.length > 0) {
        del.remove();
    }

    var categoriesRead = course.find('.category-row');
    for (var i = 0; i < categoriesRead.length; i++) {
        var category = categoriesRead.eq(i);
        var categoryId = category[0].attributes['data-parent-id'].value;
        if (categoryId == semesterid) {
            var span = category.find('span.awarded-grade')
            if (span.length > 0) {
                span.find('span.numeric-grade').show();
            } else {
                span = category.find('span.no-grade')
                span.show();
            }
            var newGrade = category.find('span.toBeDeleted' + courseNum);
            if (newGrade.length > 0) newGrade.remove();
            //show category alpha grade
            var alpha = category.find('span.alpha-grade')
            if (alpha.length > 0) alpha.show();
        }
    }

    // fix summaryDiv html
    if(summaryDivInfo[0]) summaryDivInfo[1][0].innerHTML = summaryDivInfo[2];

    //remove added Assignment
    var addedAssigs = course.find('.addedItem' + courseNum);
    if (addedAssigs.length > 0) addedAssigs.remove();
}

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

                var exceptionDiv = x.find('td.grade-column').find('.exception-grade-wrapper');
                if (exceptionDiv.length > 0) {
                    var missingspan = document.createElement('span')
                    missingspan.setAttribute('style', 'color: #a950ec;');
                    missingspan.innerText = exceptionDiv.find('.exception')[0].innerText + '! ';

                    divX.append(missingspan);
                }
                x.find('td.grade-column').append(divX);

            }
        }
    }
}

function createEditInputs(itemGivenPoints, courseNum, itemTotalPoints, i, j) {
    var divX = document.createElement('div');
    divX.setAttribute('id', 'itemInputs' + i);
    divX.setAttribute('class', 'itemInputs' + courseNum);
    divX.setAttribute('style', 'border-radius:6px; width:410px; padding:17px;float:right');
    divX.setAttribute('originalGiven', itemGivenPoints);
    divX.setAttribute('originalTotal', itemTotalPoints);

    inputValueItems(divX, courseNum, 'changeGiven', 'changeTotal', itemGivenPoints.toString(), itemTotalPoints.toString(), '52px', false, j, i);

    var hide = document.createElement('button');
    hide.innerHTML = 'Exclude Assignment';
    hide.setAttribute('hide', 'no');
    hide.setAttribute('cat', j.toString());
    hide.setAttribute('divId', i.toString());
    hide.setAttribute('class', 'deleteGiven' + courseNum);
    hide.setAttribute('style', "margin-left: 10px;margin-right: 10px;border-color:black;font-size:10px; padding: 1px 10px 1px 10px; border-radius:4px; height: 20px; background-color:Ivory; color:grey;");
    divX.appendChild(hide);

    return divX;
}

function calculateGrade(actualCategory, courseNum, semester, categoryWeights, currentGivenPoints, currentTotalPoints, addedTotalPoints, addedGivenPoints, categoryNum, summaryDivInfo, originalGrades) {
    var newGrade = 0;

    //check if category has 0 / 0 points
    var tempCategoryWeights = [];

    //decimal new category grade;
    for (var i = 0; i < currentGivenPoints.length; i++) {
        var total = currentTotalPoints[i] + addedTotalPoints[i];
        if (total != 0) {
            tempCategoryWeights.push(categoryWeights[i])
            newGrade += (currentGivenPoints[i] + addedGivenPoints[i]) / total * categoryWeights[i] / 100;
        } else
            tempCategoryWeights.push(0)
    }

    //fix grade if totalweights isnt 100%
    var totalWeight = 0;
    for (var i = 0; i < categoryWeights.length; i++) {
        totalWeight += tempCategoryWeights[i];
    }

    if (totalWeight != 100) {
        if (totalWeight > 100 && totalWeight % 100 == 0) {
            //no weightage - ex: roberts calc ab
            var given = 0;
            var total = 0;
            for (var i = 0; i < currentGivenPoints.length; i++) {
                given += currentGivenPoints[i] + addedGivenPoints[i];
                total += currentTotalPoints[i] + addedTotalPoints[i];
            }
            newGrade = given / total;
        } else {
            //totalWeight less than 100
            newGrade = newGrade / totalWeight * 100;
        }
    }

    //new percent grade
    newGrade = newGrade * 100;
    newGrade = newGrade.toFixed(2);

    //set semester and summary grade value
    // var summaryDiv = $('.gradebook-course').eq(courseNum).find('.summary-course').find('.course-grade-wrapper');
    var change = semester.find('span.toBeDeleted' + courseNum);
    if (change.length > 0) {
        if (newGrade == originalGrades[0]) {
            semester.find('span.toBeDeleted' + courseNum).remove();
            var span = semester.find('span.awarded-grade')
            if (span.length > 0) {
                span.find('span.numeric-grade').show();
            } else {
                span = semester.find('span.no-grade')
                span.show();
            }

            if(summaryDivInfo[0]) summaryDivInfo[1][0].innerHTML = summaryDivInfo[2];
        } else {
            if(summaryDivInfo[0]) summaryDivInfo[1][0].innerHTML = "<span style='background-color:yellow'>Course Grade: (" + newGrade.toString() + "%)</span>";
            semester.find('span.toBeDeleted' + courseNum).text('(' + newGrade + '%)');
        }
    } else {
        if (newGrade != originalGrades[0]) {
            var sp = document.createElement('span');
            sp.innerHTML = '(' + newGrade.toString() + '%)';
            sp.setAttribute('style', 'background-color:yellow');
            sp.setAttribute('class', 'toBeDeleted' + courseNum);

            var span = semester.find('span.awarded-grade')
            //span name changes to no-grade if no grade for semester is posted
            if (span.length > 0) {
                span.append(sp);
                span.find('span.numeric-grade').hide();
            } else {
                span = semester.find('span.no-grade')
                $(sp).insertBefore(span);
                span.hide();
            }
            //hide alpha grade if there
            var alpha = span.find('span.alpha-grade')
            if (alpha.length > 0) alpha.hide();

            //add span to summaryDiv
            if(summaryDivInfo[0]) summaryDivInfo[1][0].innerHTML = "<span style='background-color:yellow'>Course Grade: (" + newGrade.toString() + "%)</span>";
        }
    }

    //setting category grade values
    var i = parseInt(categoryNum);
    var categoryGrade = 0;
    if (tempCategoryWeights[i] != 0)
        categoryGrade = (currentGivenPoints[i] + addedGivenPoints[i]) / (currentTotalPoints[i] + addedTotalPoints[i]) * 100;

    categoryGrade = categoryGrade.toFixed(2);
    var cateString = '(' + categoryGrade + '%)';

    var category = actualCategory[i];
    var change = category.find('span.toBeDeleted' + courseNum);

    //set '-' value in gradebook to 0%
    var noGrade = category.find('span.no-grade')
    if (noGrade.length > 0) noGrade[0].innerHTML = '(0.00%)'

    if (change.length > 0) {
        if (parseFloat(categoryGrade) == originalGrades[i + 1]) {

            var span = category.find('span.awarded-grade')
            if (span.length > 0) {
                span.find('span.numeric-grade').show();
            } else {
                span = category.find('span.no-grade')
                span.innerHTML = '0.00%'
                span.show();
            }
            category.find('span.toBeDeleted' + courseNum).remove();

        } else
            category.find('span.toBeDeleted' + courseNum).text(cateString);
    } else {
        if (parseFloat(categoryGrade) != originalGrades[i + 1]) {
            var sp = document.createElement('span');
            sp.innerHTML = cateString;
            sp.setAttribute('style', 'background-color:yellow');
            sp.setAttribute('class', 'toBeDeleted' + courseNum);

            var span = actualCategory[i].find('span.awarded-grade')
            //span name changes to no-grade if no grade for category is posted
            if (span.length > 0) {
                span.append(sp);
                span.find('span.numeric-grade').hide();
            } else {
                span = actualCategory[i].find('span.no-grade')
                $(sp).insertBefore(span);
                span.hide();
            }
            //hide alpha grade
            var alpha = span.find('span.alpha-grade')
            if (alpha.length > 0) alpha.hide();
        }
    }

    //set final calc's current grade value
    var currentGradeFinalCalc = $('#currentGrade')
    if (currentGradeFinalCalc.length > 0) currentGradeFinalCalc[0].value = newGrade.toString()
}

function addAssignment(category, score, total, courseNum, categoryChoosen, semester) {
    var itemDiv = document.createElement('div');
    itemDiv.setAttribute('class', 'addedItem' + courseNum);
    itemDiv.setAttribute('style', 'width:476px; padding:10px;');

    var assig = document.createElement('span');
    assig.setAttribute('style', 'color:black; font-size:11px; margin-left:20px; margin-right:26px;color:#e60f0f');
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
    inputValueItems(itemDiv, courseNum, 'changeGivenAdd', 'changeTotalAdd', score, total, '52px', false, categoryChoosen.toString(), 0);
    itemDiv.append(del);
    itemDiv.append(cate);

    semester.after(itemDiv);
}

function originalGradeHeader(courseNum, originalGrade) {
    var added = document.createElement('div');
    added.setAttribute('style', 'width:420px;border-radius: 6px;background-color:#ec0b0b; padding:6px; display:inline-block; margin-top:-10px');
    added.setAttribute('id', 'originalGradeDiv' + courseNum);

    var grade = document.createElement('h2');
    grade.setAttribute('id', 'grade' + courseNum);
    grade.setAttribute('style', "font-size:14px; color:white");
    grade.innerHTML = 'Original Grade: ' + originalGrade;
    added.appendChild(grade);

    return added;
}

function createInputArea(categoryNames, courseNum) {
    var div1 = document.createElement('div');
    div1.setAttribute('id', 'input' + courseNum);
    div1.setAttribute('style', 'width:420px;height:40px;border-radius: 6px;background-color:#ec0b0b; padding:7px 7px 7px 16px; margin-top:2px; margin-bottom:-4px');

    categorySelect(div1, categoryNames, courseNum);
    inputValueItems(div1, courseNum, 'score', 'total', ' Score', ' Total', '55px', true, 0, 0);

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
    score.setAttribute('style', "padding-left:5px;font-size:11px; margin-right:10px; border-radius: 5px;width:" + width + "; height: 22px; background-color:Ivory");

    var total = document.createElement('input');
    total.setAttribute('id', id2 + courseNum);
    if (!adding) total.setAttribute('cat', j.toString());
    if (!adding) total.setAttribute('divId', i.toString())
    if (!adding) total.setAttribute('previousVal', ph2);
    total.setAttribute('type', 'number');
    total.setAttribute(addOrEdit, ph2);
    total.setAttribute('style', "padding-left:5px;font-size:11px; margin-right:10px; border-radius: 5px;width:" + width + "; height: 22px; background-color:Ivory");

    parent.appendChild(score);
    parent.appendChild(total);
}

function categorySelect(parent, categoryNames, courseNum) {
    var sl = document.createElement("select");
    sl.setAttribute('id', 'select' + courseNum);
    sl.setAttribute('style', "width:153px; height:26px; font-size:11px; margin-right:10px; background-color:Ivory; color:Grey; margin-top:1px; border-radius:5px");
    for (var i = 0; i < categoryNames.length; i++) {
        var op = document.createElement('option');
        op.value = categoryNames[i];
        op.text = categoryNames[i];
        sl.appendChild(op);
    }
    parent.appendChild(sl);
}

function createClassButton(id, num, startColor) {
    var button = document.createElement('button');
    button.innerHTML = id;
    button.setAttribute('id', id);
    button.setAttribute('class', 'enableCalc');
    button.setAttribute('courseNum', num.toString());
    button.setAttribute('color', startColor);
    var backgroundColor = '#00b700';
    if (startColor == 'tomato') backgroundColor = '#d20909';
    button.setAttribute('style', 'background-color:' + backgroundColor + '; border-width: 3px; color:white; margin-left:10px; margin-top: 3px; margin-bottom: 5px; font-size:10px; padding:10px; border-radius: 6px;');
    return button;
}


function setColorOfButton(ele, singleGradeCalc) {
    var cut = ele.attributes['style'].value.indexOf(';');
    var othercss = ele.attributes['style'].value.substring(cut);

    if (ele.attributes['color'].value == 'tomato') {
        ele.attributes['color'].value = 'green';
        ele.setAttribute('style', 'background-color:#00b700' + othercss);
        if (singleGradeCalc) $('button.enableCalc')[0].innerHTML = 'Disable Grade Calculator'
        return true;
    } else {
        ele.attributes['color'].value = 'tomato';
        ele.setAttribute('style', 'background-color:#d20909' + othercss);
        if (singleGradeCalc) $('button.enableCalc')[0].innerHTML = 'Enable Grade Calculator'
        return false;
    }
}

//-------------Final Calculator Functions----------------//

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

function enableFinalCalc() {
    var div = document.createElement('div');
    div.setAttribute('id', 'finalGradeDiv');
    div.setAttribute('style', 'padding-left:3px');
    var enableCalc = document.createElement('button');
    enableCalc.innerHTML = 'Enable Final Calculator';
    enableCalc.setAttribute('id', 'enableFinalCalc');
    enableCalc.setAttribute('style', 'border-width: 3px; background-color:#7d07c7; color:white; margin-left:12px; font-size:10px; padding:10px; border-radius: 6px;');
    div.appendChild(enableCalc);

    div.append(finalCalcDiv());

    return div;
}

function finalCalculatorHandlers() {
    //enable final Calc Handler
    $('button#enableFinalCalc').click(function (element) {
        var str = element.target.innerHTML;
        if (str == "Enable Final Calculator") {
            // $('#finalGradeDiv').append(finalCalcDiv());
            $('#finalGradeDiv').find('div#finalCalc').show();
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
            $('#finalGradeDiv').find('div#finalCalc').hide();
            element.target.innerHTML = "Enable Final Calculator";
        }
    });
}

//-------------Always Enable Functions-------------//

function alwaysEnable(){
    var d = document.createElement('div')
    d.setAttribute('id', 'alwaysEnableDiv')
    d.setAttribute('style', 'float:right; margin-top:22px;')

    var inp = document.createElement('input')
    inp.setAttribute('type', 'checkbox')
    inp.setAttribute('style', 'width: 8px;')
    inp.setAttribute('id', 'alwaysEnable')

    var lbl = document.createElement('label');
    lbl.setAttribute('for', 'alwaysEnable')
    lbl.setAttribute('style', 'margin-left: 5px; font-size:8px;')
    lbl.innerHTML = 'Always Enable Grade Calculator on Load';

    d.appendChild(inp)
    d.appendChild(lbl)
    return d;

}

function alwaysEnableHandlers(){
    chrome.storage.sync.get(['alwaysEnable'], function(val){
        var chk = $('#alwaysEnable');

        chk[0].checked = val.alwaysEnable

        chk.click(function(){
            var isChecked = chk[0].checked;
            chrome.storage.sync.set({alwaysEnable: isChecked});
        })
    })
}

//returns summaryDiv Info
function summaryDivInfo(course){
    var summaryDiv = course.find('.summary-course').find('.course-grade-wrapper');
    var hasSummaryDiv = false;
    var summaryDivHtml = "";
    if(summaryDiv.length > 0){
        hasSummaryDiv = true;
        summaryDivHtml = summaryDiv[0].innerHTML;
    }
    var arr = [hasSummaryDiv, summaryDiv, summaryDivHtml] 
    return arr;
}