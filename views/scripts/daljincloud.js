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

function fileframeSendPostMsg() {
    
    var msg = {};
    msg['type'] = arguments[0];

    if(arguments[1]) {
        msg['data'] = arguments[1];
    }
    else {
        msg['data'] = null;
    }


    $('#fileframe')[0].contentWindow.postMessage(JSON.stringify(msg));


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

            console.dir(getCheckedItems(path));
            fileframeSendPostMsg('init' , getCheckedItems(path));
        break;

        case 'check' :
            additem(inputData['path'] , inputData['file']);
            console.dir(fileTree);
        break;

        case 'uncheck' :
            removeitem(inputData['path'] , inputData['file']);
            console.dir(fileTree);
        break;

    }
});


var fileTree = new TreeNode(null , null , null);

function TreeNode(parent , name , type , size) {
    this.parent = parent;
    this.children = [];

    this.name = name;
    this.type = type;
    this.size = size;
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
                curNode.children[j].size += file.size;
                res = true;
                break;
            }
        }
        if(!res) {
            curNode.children.push(new TreeNode(curNode , sp_path[i] , 'directory' , 0));
        }
        curNode = curNode.children[j];
    }
    curNode.children.push(new TreeNode(curNode , file.fullname , file.type , file.size));
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
            curNode.children.splice(i , 1);
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
        output.push(curNode.children[i].name);
    }
    return output;
}