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
    $('#fileframe').attr('src' , "/fileframe?path=" + path + "&listtype=" + listtype);
}

var fileframeSendPostMsg = function(message) {
    $('#fileframe')[0].contentWindow.postMessage(message);
}


window.addEventListener('message' , function(e) {
    var inputData = JSON.parse(e.data);
    var type = inputData['type'];
    var data = inputData['data'];

    switch(type) {
        case 'init' : 
            path = data['path']
            used_storage = data['used_storage'];
            
            $('.progress-bar').attr('data-label' , getVolumeSize(used_storage , 0) + '/' + getVolumeSize(max_storage , 0));
            $('.progress-bar')[0].style.setProperty('--width' , used_storage / max_storage + '');
        break;

        case 'allcheck' :

        break;

        case 'unallcheck' :

        break;

        case 'download' :
            
        break;

        case 'delete' :
            
        break;

        

    }
});













