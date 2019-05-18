$(document).ready(function () {

    var output = {};
    output["type"] = "init";
    output["data"] = { 'path' : path , 'used_storage' : used_storage};
    window.parent.postMessage(JSON.stringify(output) , '*');

    $('.checkbox').click(function() {
        var msg = {};
        msg['type'] = null;
        msg['path'] = path;
        msg['file'] = files[getItemPos($(this))];

        if($(this).children('.uncheck').css('display') == 'none') {
            msg['type'] = 'uncheck';
            $(this).children('.uncheck').css('display' , 'inline-block');
            $(this).children('.check').css('display' , 'none');
        }
        else {
            msg['type'] = 'check';
            $(this).children('.uncheck').css('display' , 'none');
            $(this).children('.check').css('display' , 'inline-block');
        }

        window.parent.postMessage(JSON.stringify(msg) , '*');
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

var getItemPos = function(elem) {
    var itemId = elem.attr('id');
    return parseInt(itemId.substring(itemId.lastIndexOf('_')+1 , itemId.length));
}

var allcheckNuncheck = function(toggle) {
    var msg = {};
    msg['path'] = path;
    if(toggle) {
        for(var i = 0 ; i < files_length; i++) {
            if($('#checkbox_' + i).children('.check').css('display') == 'none') {
                $('#checkbox_' + i).children('.uncheck').css('display' , 'none');
                $('#checkbox_' + i).children('.check').css('display' , 'inline-block');
                msg['type'] = 'check';
                msg['file'] = files[i];
                window.parent.postMessage(JSON.stringify(msg) , '*');
            }
        }
    }
    else {
        for(var i = 0 ; i < files_length; i++) {
            if($('#checkbox_' + i).children('.uncheck').css('display') == 'none') {
                $('#checkbox_' + i).children('.check').css('display' , 'none');
                $('#checkbox_' + i).children('.uncheck').css('display' , 'inline-block');
                msg['type'] = 'uncheck';
                msg['file'] = files[i];
                window.parent.postMessage(JSON.stringify(msg) , '*');
            }
        }
    }
}


window.addEventListener('message' , function(e) {
    switch(e.data) {
        case "allcheck" :
            allcheckNuncheck(true);
            break;

        case "alluncheck" :
            allcheckNuncheck(false);
            break;

        default :   
            //init
            var input = JSON.parse(e.data);
            for(var i = 0 ; i < Object.keys(input).length; i++) {
                for(var j = 0 ; j < files_length; j++) {
                    if(input[i] == files[j]['fullname']) {
                        $('#checkbox_'+j).children('.check').trigger('click');
                    } 
                }
            }
            break;
    }
});

