$(document).ready(function () {
    
    var date = new Date();
    showCalender($('.inmonth') , date.getFullYear() , date.getMonth()+1);

});

var day31Month = new Array(1 , 3 , 5 , 7 , 8 , 10 , 12);
var day30Month = new Array(4, 6 , 9 ,11);

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
        alert('error');
    }



    var tr_cnt = 0;
    res +=  "<table><thead>";
    res +=  "<th><div>일</div></th>";
    res +=  "<th><div>월</div></th>";
    res +=  "<th><div>화</div></th>";
    res +=  "<th><div>수</div></th>";
    res +=  "<th><div>목</div></th>";
    res +=  "<th><div>금</div></th>";
    res +=  "<th><div>토</div></th>";
    res +=  "</thead><tbody>";
    if(offsetDay != 0) {
        res += "<tr>";
    }
    for(var i = 0; i < offsetDay; i++) {
        res += "<td></td>";
        tr_cnt++;
    }
    for(var i = 1; i <= max_day; i++) {
        if(tr_cnt == 0) {
            res += "<tr>";
        }
        res += "<td>";
        res += '<div class="calender-date">' + i +'</div>';
        res += '<div class="calender-content"><div>';
        res += "</td>";
        tr_cnt++;

        if(tr_cnt == 7) {
            res += "</tr>";
            tr_cnt = 0;
        }

    }
    res += "</tbody></table>";



    elem.html(res);




}