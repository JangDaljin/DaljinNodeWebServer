$(document).ready(function () {

    var output = {};
    output["type"] = "init";
    output["data"] = { 'path' : path , 'used_storage' : used_storage};
    window.parent.postMessage(JSON.stringify(output) , '*');

    $('.checkbox').click(function() {
        if($(this).children('.uncheck').css('display') == 'none') {
            $(this).children('.uncheck').css('display' , 'inline-block');
            $(this).children('.check').css('display' , 'none');
            files_checkedList[getItemPos($(this))] = false;
        }
        else {
            $(this).children('.uncheck').css('display' , 'none');
            $(this).children('.check').css('display' , 'inline-block');
            files_checkedList[getItemPos($(this))] = true;
        }
    });

    $('.lt-li ,.gt-dir').dblclick(function() {
        var itemPos = getItemPos($(this));
        
        if(itemPos == -1) {
            window.location.href = "?path=" + encodeURIComponent(path.substring(0,path.lastIndexOf('/'))) +  "&listtype=" + listtype;
        }
        else {
            if(files[itemPos]['type'] == 'directory') {
                window.location.href = "?path=" + encodeURIComponent(path + "/" + files[itemPos]['fullname']) +
                                        "&listtype=" + listtype;
            }
        }
    });

    $('.gt-selectable').click(function() {
        
    });

});

var files_checkedList = new Array();
for(var i = 0 ; i < files_length; i++) {
    files_checkedList[i] = false;
}

var getCheckedList = function() {
    var output = {};
    var cnt = 0 ;
    for(var i = 0 ;  i < files_length; i++) {
        if(files_checkedList[i]) {
            files[i]['path'] = path;
            output[cnt++] = files[i];
        }
    }
    return output;
}

var getItemPos = function(elem) {
    var itemId = elem.attr('id');
    return parseInt(itemId.substring(itemId.lastIndexOf('_')+1 , itemId.length));
}

var allcheckNuncheck = function(toggle) {
    if(toggle) {
        $('.checkbox').children('.uncheck').css('display' , 'none');
        $('.checkbox').children('.check').css('display' , 'inline-block');
    }
    else {
        $('.checkbox').children('.uncheck').css('display' , 'inline-block');
        $('.checkbox').children('.check').css('display' , 'none');
    }

    for(var i = 0 ; i < files_length; i++) {
        files_checkedList[i] = toggle;
    }
}


window.addEventListener('message' , function(e) {
    var output = {};
    output['type'] = null;
    output['data'] = null;

    switch(e.data) {
        case "allcheck" :
            allcheckNuncheck(true);
            output['type'] = 'allcheck';
            output['data'] = getCheckedList();
            break;

        case "alluncheck" :
            allcheckNuncheck(false);
            output['type'] = 'alluncheck';
            output['data'] = getCheckedList();
            break;

        case "download" :
            output['type'] = 'download';
            output['data'] = getCheckedList();
            break;

        case "delete" :
            output['type'] = 'delete';
            output['data'] = getCheckedList();
            break;

        default :   
            output['type'] = 'unknown';
            output['data'] = null;
            break;
    }

    window.parent.postMessage(JSON.stringify(output) , '*');
});

