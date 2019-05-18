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

var path = "";
window.addEventListener('message' , function(e) {
    var inputData = JSON.parse(e.data);
    var type = inputData['type'];
    switch(type) {
        case 'init' : 
            var data = inputData['data'];
            path = data['path']
            used_storage = data['used_storage'];
            
            $('.progress-bar').attr('data-label' , getVolumeSize(used_storage , 0) + '/' + getVolumeSize(max_storage , 0));
            $('.progress-bar')[0].style.setProperty('--width' , used_storage / max_storage + '');

            //console.dir(JSON.stringify(getCheckedItems(path)));
            fileframeSendPostMsg(JSON.stringify(getCheckedItems(path)));
        break;

        case 'check' :
            additem(inputData['path'] , inputData['file']);
            console.dir(filetree);
        break;

        case 'uncheck' :
            removeitem(inputData['path'] , inputData['file']);
            //console.dir(filetree);
        break;

    }
});


var filetree = {};
var additem = function(path , file) {
    var sp_path = path.split('/');
    var curFiletree = filetree;
    var i = 1;
    for(i = 1 ; i < sp_path.length ; i++) {
        if(sp_path[i] == "") {
            break;
        }
        var curKeys = Object.keys(curFiletree);
        var res = false;
        var j = 0;
        for(j = 0 ; j < curKeys.length; j ++) {
            if(curKeys[j] == sp_path[i]) {
                res = true;
                break;
            }
        }
        if(!res) {
            curFiletree[sp_path[i]] = {};
        }
        curFiletree = curFiletree[sp_path[i]];
    }
    curFiletree[file.fullname] = file;
}

var removeitem = function(path , file) {
    var sp_path = path.split('/');
    var curFiletree = filetree;

    var i = 1;
    for(i = 1 ; i < sp_path.length ; i++) {
        if(sp_path[i] == "") {
            break;
        }
        var curKeys = Object.keys(curFiletree);
        var j = 0;
        for(j = 0 ; j < curKeys.length; j ++) {
            if(curKeys[j] == sp_path[i]) {
                break;
            }
        }
        curFiletree = curFiletree[sp_path[i]];
    }
    delete curFiletree[file.fullname]
}

var getCheckedItems = function(path) {
    var sp_path = path.split('/');
    var curFiletree = filetree;
    var i = 1;
    for(i = 1 ; i < sp_path.length ; i++) {
        if(sp_path[i] == "") {
            break;
        }
        var curKeys = Object.keys(curFiletree);
        var res = false;
        var j = 0;
        for(j = 0 ; j < curKeys.length; j ++) {
            if(curKeys[j] == sp_path[i]) {
                res = true;
                break;
            }
        }
        if(!res) {
            return {};
        }
        curFiletree = curFiletree[sp_path[i]];
    }

    var output = {};
    for(var i = 0 ; i < Object.keys(curFiletree).length; i++) {

        output[i] = curFiletree[Object.keys(curFiletree)[i]].fullname;
    }
    return output;
}