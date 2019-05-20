var files_isChecked = [];

$(document).ready(function () {

    var output = {};
    output["type"] = "init";
    output["data"] = { 'path' : path , 'used_storage' : used_storage};
    window.parent.postMessage(JSON.stringify(output) , '*');

    $('.checkbox , .gt-selectable').click(function() {
        event.preventDefault();
        event.stopPropagation();
        var msg = {};
        msg['type'] = null;
        msg['path'] = path;
        var pos = getItemPos($(this));
        msg['file'] = files[pos];

        if(itemToggle(pos)) {
            msg['type'] = 'check';
        }
        else {
            msg['type'] = 'uncheck';
        }
        //console.dir(msg);
        window.parent.postMessage(JSON.stringify(msg) , '*');
    }).dblclick(function() {
        event.stopPropagation();
    });

    $('.lt-li ,.gt-dir').dblclick(function() {
        event.stopPropagation();
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
    }).click(function() {
        event.stopPropagation();
    });

});

var getItemPos = function(elem) {
    var itemId = elem.attr('id');
    return parseInt(itemId.substring(itemId.lastIndexOf('_')+1 , itemId.length));
}

var allcheckNuncheck = function(toggle) {
    var msg = {};
    msg['path'] = path;

    for(var i = 0 ; i < files_length; i++) {
        itemToggle(i , toggle);
        if(toggle) {
            msg['type'] = 'check';
        }
        else {
            msg['type'] = 'uncheck';
        }
        msg['file'] = files[i];
        window.parent.postMessage(JSON.stringify(msg) , '*');
    }
}

function itemToggle(pos) {
    var res = false;
    var check = null;
    if(arguments[1] != null) {
        check = arguments[1];
    }

    switch(listtype) {
        case 'grid' :
            if(check == true) {
                $('#item_' + pos).css('background-color' , 'rgba(133 , 184 , 203 , 0.5)');
                $('#item_' + pos).css('border' , '4px solid #1D6A96');
                $('#item_' + pos).hover(function() {
                    $(this).css('border' , '4px solid #1D6A96');
                } , function() {
                    $(this).css('border' , '4px solid #1D6A96');
                });
                res = true;
                files_isChecked[pos] = true;
            }
            else if(check == false) {
                $('#item_' + pos).css('background-color' , '#D1DDDB');
                $('#item_' + pos).css('border' , '4px solid #D1DDDB');
                $('#item_' + pos).hover(function() {
                    $(this).css('border' , '4px solid #1D6A96');
                } , 
                function() {
                    $(this).css('border' , '4px solid #D1DDDB');
                });
                res = false;
                files_isChecked[pos] = false;
            }
            else {
                if(files_isChecked[pos]) {
                    $('#item_' + pos).css('background-color' , '#D1DDDB');
                    $('#item_' + pos).css('border' , '4px solid #D1DDDB');
                    $('#item_' + pos).hover(function() {
                        $(this).css('border' , '4px solid #1D6A96');
                    } , 
                    function() {
                        $(this).css('border' , '4px solid #D1DDDB');
                    });
                    res = false;
                    files_isChecked[pos] = false;
                }
                else {
                    $('#item_' + pos).css('background-color' , 'rgba(133 , 184 , 203 , 0.5)');
                    $('#item_' + pos).css('border' , '4px solid #1D6A96');
                    $('#item_' + pos).hover(function() {
                        $(this).css('border' , '4px solid #1D6A96');
                    } , function() {
                        $(this).css('border' , '4px solid #1D6A96');
                    });
                    res = true;
                    files_isChecked[pos] = true;
                }
            }
            break;
        case 'list' : 
            if(check == true) {
                $('#checkbox_' + pos).children('.uncheck').css('display' , 'none');
                $('#checkbox_' + pos).children('.check').css('display' , 'inline-block');
                res = true;
                files_isChecked[pos] = true;
                
            }
            else if(check == false){
                $('#checkbox_' + pos).children('.uncheck').css('display' , 'inline-block');
                $('#checkbox_' + pos).children('.check').css('display' , 'none');
                res = false;
                files_isChecked[pos] = false;
            }
            else {
                //toggle
                if(files_isChecked[pos]) {
                    $('#checkbox_' + pos).children('.uncheck').css('display' , 'inline-block');
                    $('#checkbox_' + pos).children('.check').css('display' , 'none');
                    res = false;
                    files_isChecked[pos] = false;
                }
                else {
                    $('#checkbox_' + pos).children('.uncheck').css('display' , 'none');
                    $('#checkbox_' + pos).children('.check').css('display' , 'inline-block');
                    res = true;
                    files_isChecked[pos] = true;
                }
            }
            break;
    }
    return res;
}

window.addEventListener('message' , function(e) {

    var input = JSON.parse(e.data);
    var type = input.type;
    var data = input.data;
    switch(type) {
        case "init" :
            if(data == null) {
                break;
            }
            else {
                for(var i = 0 ; i < files_length; i++) {
                    files_isChecked.push(false);
                }
    
                for(var i = 0; i < data.length; i++) {
                    for(var j = 0 ; j < files_length; j++) {
                        if(data[i] == files[j]['fullname']) {
                            itemToggle(j);
                        }
                    }
                }
            }
            
            break;

        case "allcheck" :
            allcheckNuncheck(true);
            break;

        case "alluncheck" :
            allcheckNuncheck(false);
            break;

        default :   
            
            break;
    }
});

