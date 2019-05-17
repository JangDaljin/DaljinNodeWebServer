$(document).ready(function () {
    
    //폴더만들기 메뉴 버튼
    $("#rightmenu_mkdir").click(function (e) {
        e.preventDefault();
        $("#mkdir_modal").css('display' , 'flex');
    });

    //업로드 메뉴 버튼
    $("#rightmenu_upload").click(function (e) {
        e.preventDefault();
        $("#upload_modal").css('display' , 'flex');
    });

    //팝업창 닫기    
    $(".modal-close").click(function (e) { 
        e.preventDefault();
        $(".modal-background").hide();
    });

});


var showfileframe = function(listtype) {
    $('#fileframe').attr('src' , "/fileframe?listtype=" + listtype);
}

var fileframeSendPostMsg = function(message) {
    $('#fileframe').contentWindow.postMessage(message);
}


window.addEventListener('message' , function(e) {
    var inputData = JSON.parse(e.data);
    var type = inputData['type'];
    var data = inputData['data'];

    switch(type) {
        case 'path' : 
        path = data;
        break;

        case 'checkedList' :
        
        break;
    }
})