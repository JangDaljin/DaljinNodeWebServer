$(document).ready(function () {
    
    


    //다운로드
    $('#rightmenu_download').click(function (e) {
        var items = getCheckedItems(path);
        if(items == null) {
            return;
        }
        downloadNext(items , 0 , items.length);
    });

    var downloadNext = function(items , pos , length){
        if(pos >= length) {
            return;
        }

        var formData = new FormData();
        formData.append('n_downloadItem' , items[pos].name.trim());
        formData.append('n_itemType' , items[pos].type);
        formData.append('n_itemPath' , path);

        var output = {};
        output['n_downloadItem'] = items[pos].name.trim();
        output['n_itemType'] = items[pos].type;
        output['n_itemPath'] = path
        //jQuery.fileDownload.js plugin 사용
        $.fileDownload('/download', { 
                httpMethod: "POST", 
                data: JSON.stringify(output),

                successCallback: function (url) {
                        downloadNext(items , pos+1 , length);
                },
                failCallback: function (responseHtml, url, error) { 
                        alert("DOWNLOAD ERROR");
                }
        });
    }

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


var showfileframe = function(_listtype) {
    listtype = _listtype;
    $('#fileframe').attr('src' , "/fileframe?path=" + path + "&listtype=" + _listtype);
}

function fileframeSendPostMsg() {
    var msg = {};
    msg['type'] = arguments[0];

    if(arguments[1]) {
        msg['data'] = arguments[1];
    }
    else {
        msg['data'] = null;
    }


    $('#fileframe')[0].contentWindow.postMessage(JSON.stringify(msg) , '*');
    var elem = null;
    $('.frametype').css('color' , '#283B42').css('background' , '#D1DDDB').hover(
        function() {
            $(this).css('color' , '#1D6A96');
        },
        function() {
            $(this).css('color' , '#283B42');
        }
    ).children('a').css('cursor' , 'pointer');

    if(listtype == 'grid') {
        elem = $('#gridicon');
    }
    else if(listtype == 'list') {
       elem = $('#listicon');
    }
    elem.css('color' , '#1D6A96').css('background' , '#283B42').children('a').css('cursor' , 'default');
    elem.unbind('mouseenter mouseleave');
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

            //console.dir(getCheckedItems(path));
            var items   = getCheckedItems(path);
            var output = null;
            if(items != null) {
                output = {};
                var cnt = 0;
                for(var i = 0 ; i < items.length; i++) {
                    output[cnt++] = items[i].name;
                }
            }
            fileframeSendPostMsg('init' , output);
        break;

        case 'check' :
            additem(inputData['path'] , inputData['file']);
            //console.dir(fileTree);
        break;

        case 'uncheck' :
            removeitem(inputData['path'] , inputData['file']);
            //console.dir(fileTree);
        break;

    }
});


var fileTree = new TreeNode(null , null , null);

function TreeNode(parent , name , type) {
    this.parent = parent;
    this.children = [];
    this.name = name;
    this.type = type;
    this.ischecked = false;
}

var additem = function(path , file) {
    var sp_path = path.split('/');
    var curNode = fileTree;
    var i = 1;
    var j = 0;
    for(i = 1 ; i < sp_path.length ; i++) {
        if(sp_path[i] == "") {
            break;
        }
        var res = false;
        for(j = 0 ; j < curNode.children.length; j++) {
            if(curNode.children[j].name == sp_path[i] && curNode.children[j].type == 'directory') {
                res = true;
                break;
            }
        }
        if(!res) {
            curNode.children.push(new TreeNode(curNode , sp_path[i] , 'directory' , 0));
        }
        curNode = curNode.children[j];
    }

    var isExist = false;
    for(i = 0; i < curNode.children.length; i++) {
        if(curNode.children[i].fullname == file.fullname && curNode.children[i].type == file.type) {
            isExist = true;
            curNode.children[i].ischecked = true;
            break;
        }
    }
    if(isExist == false) {
        var newNode = new TreeNode(curNode , file.fullname , file.type);
        newNode.ischecked = true;
        curNode.children.push(newNode);
    }
}

var removeitem = function(path , file) {
    var sp_path = path.split('/');
    var curNode = fileTree;
    var i = 1;
    var j = 0;
    for(i = 1 ; i < sp_path.length ; i++) {
        if(sp_path[i] == "") {
            break;
        }
        for(j = 0 ; j < curNode.children.length; j++) {
            if(curNode.children[j].name == sp_path[i] && curNode.children[j].type == 'directory') {
                break;
            }
        }
        curNode = curNode.children[j];
    }
    
    for(i = 0; i < curNode.children.length; i++) {

        if(curNode.children[i].name == file.fullname) {
            if(curNode.children[i].type == 'directory') {
                curNode.children[i].ischecked = false;
            }
            else {
                curNode.children.splice(i , 1);
            }
            break;
        }
    }
}

var getCheckedItems = function(path) {
    var sp_path = path.split('/');
    var curNode = fileTree;
    var i = 1;
    for(i = 1 ; i < sp_path.length ; i++) {
        if(sp_path[i] == "") {
            break;
        }
        var res = false;
        var j = 0;
        for(j = 0 ; j < curNode.children.length; j++) {
            if(curNode.children[j].name == sp_path[i] && curNode.children[j].type == 'directory') {
                res = true;
                break;
            }
        }
        if(!res) {
            return null;
        }
        curNode = curNode.children[j];
    }

    var output = [];
    for(i = 0 ; i < curNode.children.length; i++) {
        if(curNode.children[i].type == 'directory') {
            if(curNode.children[i].ischecked) {
                output.push(curNode.children[i]);
            }
        }
        else {
            output.push(curNode.children[i]);
        }
    }
    return output;
}