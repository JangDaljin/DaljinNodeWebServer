$(document).ready(function () {
    var date = new Date();

    var year = date.getFullYear()
    var month = date.getMonth()+1
    showAllCalender(year , month);


    //년도 바꾸기
    $('#in-year').click(function (e) {
        $('#in-year').hide();
        $('#in-year-input').show();
        $('#in-year-input').focus();
    });

    $('#in-year-input').keyup(function (e) { 
        //글자수 4개까지 인정
        if($(this).val().length > 4) {
            $(this).val($(this).val().substring(0,4));
         }

        if(e.keyCode == 13) {

            var inputtext = $(this).val()

            if(inputtext.length != 0 && parseInt(inputtext) >= 0 && parseInt(inputtext) <= 9999) {
                showAllCalender(parseInt($('#in-year-input').val()) , parseInt($('#in-month').text()));
            }
            $('#in-year').show();
            $('#in-year-input').hide();
            $('#in-year-input').val('');
        }
    });

    $('#in-year-input').blur(function (e) {
        $('#in-year').show();
        $('#in-year-input').hide();
        $('#in-year-input').val('');
    });


    //월 바꾸기
    $('#in-month').click(function (e) {
        $('#in-month').hide();
        $('#in-month-input').show();
        $('#in-month-input').focus();
    });

    $('#in-month-input').blur(function (e) {
        $('#in-month').show();
        $('#in-month-input').hide();
        $('#in-month-input').val('');
    });

    $('#in-month-input').keyup(function (e) { 
        //글자수 2개까지 인정
        if($(this).val().length > 2) {
           $(this).val($(this).val().substring(0,2));
        }


        if(e.keyCode == 13) {

            var inputtext = $(this).val()

            if(inputtext.length != 0 && parseInt(inputtext) >= 1 && parseInt(inputtext) <= 12) {
                showAllCalender(parseInt($('#in-year').text()) , parseInt($('#in-month-input').val()));
            }

            $('#in-month').show();
            $('#in-month-input').hide();
            $('#in-month-input').val('');
        }
    });


    //td 클릭
    $('td').click(function(e) {
        $('.modal-background').css('display' , 'flex');
    });

    //메모 종료
    $('#exit').click(function (e) {
        $('.modal-background').hide();
    });

    //메모 저장
    $('#save').click(function (e) {
        
    });
    
    
});

var day31Month = new Array(1 , 3 , 5 , 7 , 8 , 10 , 12);
var day30Month = new Array(4, 6 , 9 ,11);



var showAllCalender = function(year , month) {

    //지난달
    if(month == 1) {
        showTitle($('.pre-calender') , year-1 , 12);
        showCalender($('.pre-month-calender') , year-1 , 12);
    }
    else {
        showTitle($('.pre-calender') , year , month-1);
        showCalender($('.pre-month-calender') , year , month-1);
    }

    //이번달
    showTitle($('.in-calender') , year , month);
    showCalender($('.in-month-calender') , year , month);


    //다음달
    if(month == 12) {
        showTitle($('.post-calender') , year+1 , 1);
        showCalender($('.post-month-calender') , year+1 , 1);
    }
    else {
        showTitle($('.post-calender') , year , month+1);
        showCalender($('.post-month-calender') , year , month+1);
    }
}

var showTitle = function(elem , year , month) {
    elem.children('.year').children('span').html(year);
    elem.children('.month').children('span').html(month);   
}

var showCalender = function(elem, year , month) {






    var date = new Date(year + '-' + month + '-1');
    var offsetDay = date.getDay();
    var max_day = 0;
    var res = "";
    if(day31Month.indexOf(month) != -1) {
        max_day = 31;
    }
    else if(day30Month.indexOf(month) != -1) {
        max_day = 30;
    }
    else if(month == 2)
    {
        if(  year % 4 == 0 && ( !(year % 100 == 0) || year % 400 == 0) ) {
            max_day = 29;
        }
        else {
            max_day = 28;
        }
    }
    else {
        alert('year = ' + year + '\n' + 'month = ' + month);
    }

    var tr_cnt = 0;
    res +=  "<table><thead>";
    res +=  "<th class='sun'><div>일</div></th>";
    res +=  "<th><div>월</div></th>";
    res +=  "<th><div>화</div></th>";
    res +=  "<th><div>수</div></th>";
    res +=  "<th><div>목</div></th>";
    res +=  "<th><div>금</div></th>";
    res +=  "<th class='sat'><div>토</div></th>";
    res +=  "</thead><tbody>";
    if(offsetDay != 0) {
        res += "<tr>";
    }
    for(var i = 0; i < offsetDay; i++) {
        res += "<td class='not-use'></td>";
        tr_cnt++;
    }
    for(var i = 1; i <= max_day; i++) {
        if(tr_cnt == 0) {
            res += "<tr>";
            res += "<td class='sun'>";
        }
        else if(tr_cnt == 6) {
            res += "<td class='sat'>";
        }
        else {
            res += "<td>";
        }
        res += '<div class="calender-date">' + i +'</div>';
        res += '<div class="calender-content"><div>';
        res += "</td>";
        tr_cnt++;
        if(tr_cnt == 7) {
            res += "</tr>";
            tr_cnt = 0;
        }
    }

    if(tr_cnt != 7) {
        for(var i = 0 ; i < 7 - tr_cnt; i++) {
            res += "<td class='not-use'></td>";
        }
        res += "</tr>";
    }
    res += "</tbody></table>";



    elem.html(res);
}