var MemoList = {};
var day31Month = new Array(1 , 3 , 5 , 7 , 8 , 10 , 12);
var day30Month = new Array(4, 6 , 9 ,11);

$(document).ready(function () {
    var date = new Date();

    var year = date.getFullYear()
    var month = date.getMonth()+1
    showAllCalender(year , month , true);


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

    

    //메모 종료
    $('#exit').click(function (e) {
        $('.modal-background').hide();
        $('#content-date').val('');
        $('#content-title').val('');
        $('#content').val('');
    });

    //메모 저장
    $('#save').click(function (e) {
        
        var sp_date = $('#content-date').val().split('-');
        year = parseInt(sp_date[0]);
        month = parseInt(sp_date[1]);
        date = parseInt(sp_date[2]);
        
        var output = {};
        output['year'] = year;
        output['month'] = month;
        output['date'] = date;
        output['title'] = $('#content-title').val();
        output['content'] = $('#content').val();
        $.ajax({
            type: "POST",
            url: "/calender/save",
            data: JSON.stringify(output),
            dataType: "json",
            contentType : "application/json",
            success: function (input) {
                if(input['result']) {
                    alert('저장 완료');

                    var yyyymmdd = YYYYMMDD(year , month , date);
                    if(MemoList[yyyymmdd]) {
                        MemoList[yyyymmdd].title = $('#content-title').val();
                        MemoList[yyyymmdd].content = $('#content').val();
                        showAllCalender(year , month , false);
                    }
                    else {
                        showAllCalender(year , month , true);
                    }
                }
                else {
                    alert('저장 실패');
                }
            }
        });
    });

    //팝업 제목 50글자 제한
    $('#content-title').on('keyup' , function(e) {
        if($(this).val().length > 50) {
            $(this).val($(this).val().substring(0,50))
        }
    });


    //팝업 내용 500글자 제한
    $('#content').on('keyup' , function(e) {
        if($(this).val().length > 500) {
            $(this).val($(this).val().substring(0,500))
        }
    });
    
    
});

//td 클릭
var tdclick = function(item , year , month , date) {
    $('.modal-background').css('display' , 'flex');

    var yyyymmdd = YYYYMMDD(year,month,date);
    if(MemoList[yyyymmdd]) {
        $('#content-title').val(MemoList[yyyymmdd].title);
        $('#content').val(MemoList[yyyymmdd].content);
    }
    $('#content-date').val(YYYYMMDD(year,month,date , '-'));
};

var showAllCalender = function(year , month , request) {
    //지난달
    if(month == 1) {
        showTitle($('.pre-calender') , year-1 , 12);
        showCalender($('.pre-month-calender') , year-1 , 12 , request);
    }
    else {
        showTitle($('.pre-calender') , year , month-1);
        showCalender($('.pre-month-calender') , year , month-1 , request);
    }

    //이번달
    showTitle($('.in-calender') , year , month);
    showCalender($('.in-month-calender') , year , month , request);


    //다음달
    if(month == 12) {
        showTitle($('.post-calender') , year+1 , 1);
        showCalender($('.post-month-calender') , year+1 , 1 , request);
    }
    else {
        showTitle($('.post-calender') , year , month+1);
        showCalender($('.post-month-calender') , year , month+1 , request);
    }
}

var showTitle = function(elem , year , month) {
    elem.children('.year').children('span').html(year);
    elem.children('.month').children('span').html(month);   
}

var showCalender = function(elem, year , month , request) {
    var logic = function () {
        var date = new Date(year + '-' + month + '-1');
            var offsetDay = date.getDay();
            var max_day = 0;
            var res = "";

            //클레스 추가 내부메소드
            var contentOn = function(yyyymmdd) { 
                if(yyyymmdd in MemoList) {
                    return 'content-on';
                } 
                else {
                    return '';
                }
            } 

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
                var yyyymmdd = YYYYMMDD(year,month,i);

                if(tr_cnt == 0) {
                    res += "<tr>";
                    res += "<td class='sun ";
                }
                else if(tr_cnt == 6) {
                    res += "<td class='sat ";
                }
                else {
                    res += "<td class='";
                }
                
                res += contentOn(yyyymmdd) + "\' onclick=\'tdclick(this ," + year + "," + month + "," + i + ");'>";
                res += '<div class="calender-date">' + i +'</div>';
                res += '<div class="calender-content">';
                if(contentOn(yyyymmdd)) {
                    res += MemoList[yyyymmdd]['title'];
                }
                res += '</div>';
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

    if(request) {
        $.get("/calender/getmemo?year=" + year + "&month=" + month ,
            function (data, textStatus, jqXHR) {
                if(data['result']) {
                    var list = data['list'];
                    for(var i = 0 ; i < list.length; i++) {
                        MemoList[YYYYMMDD(list[i].year,list[i].month,list[i].date)] = {
                            'title' : list[i].title,
                            'content' : list[i].content
                        }
                    }
                }
                logic();
            },
            "json"
        );
    }
    else {
        console.dir(MemoList);
        logic();
    }
}

    


