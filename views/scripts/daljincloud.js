var uploadQueue = new Queue();
var uploadpathQueue = new Queue();
var totalSize = 0;
var uploadSize = 0;
var curFileLoaded = 0;
var isUploading = false;
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
            fileframeSendPostMsg('alluncheck');
            return;
        }

        var output = {};
        output['item'] = items[pos].name.trim();
        output['type'] = items[pos].type;
        output['path'] = path
        //jQuery.fileDownload.js plugin 사용
        $.fileDownload('/cloud/download', { 
                httpMethod: "POST", 
                data: output,

                successCallback: function (url) {
                        downloadNext(items , pos+1 , length);
                },
                failCallback: function (responseHtml, url, error) { 
                        alert("DOWNLOAD ERROR");
                }
        });
    }

    //삭제
    $('#rightmenu_delete').click(function(e) {
        var items = getCheckedItems(path);
        if(items == null) {
            return;
        }

        var JSON_items = {};
        for(var i = 0 ; i < Object.keys(items).length; i++) {
                var JSON_item = {};
                JSON_item['name'] = items[i].name;
                JSON_item['type'] = items[i].type;
                JSON_items[i] = JSON_item;
        }

        var output = {};
        output["daletePath"] = path;
        output["deleteList"] = JSON.stringify(JSON_items);

        $.ajax({
                url : "/cloud/delete",
                type : "POST",
                data : JSON.stringify(output),
                contentType : "application/json",
                cache : false,
                async : true,
                headers : {"cache-control" : "no-cache"},
                success : function (inputdata_jsonstr) {
                        var inputdata = JSON.parse(inputdata_jsonstr);
                        var msg = "";
                        var refresh = false;
                        for(var i = 0 ; i < Object.keys(inputdata).length; i++) {
                                if(inputdata[i]['error']) {
                                        msg += inputdata[i]['msg'] + "\n";
                                }
                                else {
                                        refresh = true;
                                }
                        }
                        if(msg) {
                                alert(msg);
                        }
                        if(refresh) {
                            treeClear(path);
                            showfileframe();
                        }
                },
                error : function () {
                        alert('에러발생');
                }
        });
    });

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

    //폴더만들기
    $('#mkdir_ok').click(function (e) {
        var dir_name = $('#mkdir_text').val();
        $('#mkdir_text').val('');
        if(!dir_name) {
            alert('파일명을 재설정 해주세요.');
            return;
        }

        output = {};
        output['mkdirName'] = dir_name;
        output['mkdirPath'] = path;
        $.ajax({
                url : "/cloud/mkdir",
                type : "POST",
                data : JSON.stringify(output),
                contentType : "application/json",
                cache : false,
                async : true,
                headers : {"cache-control" : "no-cache"},
                success : function (inputdata_jsonstr) {
                        var inputdata = JSON.parse(inputdata_jsonstr);
                        alert(inputdata['msg']);
                        if(inputdata['error'] == false) {
                                showfileframe();
                        }
                },
                error : function () {
                        alert('에러발생');
                }
        });
    });

    $('#dropzone').on('dragover' , function(e){ 
        e.stopPropagation();
        e.preventDefault();
        $(this).css('border-color' , '#1D6A96').css('color' , '#1D6A96');
        $(this).css('background-color' , 'rgba(40 ,59, 66 , 0.5)');
        $('.modal-dragbox-image').css('color' , '#1D6A96');
    });

    
    $('#dropzone').on('dragleave' , function(e){ 
        e.stopPropagation();
        e.preventDefault();
        $(this).css('border-color' , '#283B42');
        $(this).css('background-color' , 'inherit');
        $('.modal-dragbox-image').css('color' , '#283B42');
    });

    
    $('#dropzone').on('drop' , function(e){ 
        e.stopPropagation();
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        if(files != null){
            if(files.length < 1){
                alert("폴더 업로드 불가");
                return;
            }
            //upload(files);
            qUpload(files);
        }else{
            alert("ERROR");
        }
    });

    $('#uploadbutton').change(function (e) {
        //upload($(this)[0].files);
        var files = $(this)[0].files
        qUpload(files);
        $(this).val('');
    });

    
    var qUpload = function (files) {
        for(var i = 0 ; i < files.length; i++) {
            uploadQueue.enqueue(files[i]);
            uploadpathQueue.enqueue(path);
            totalSize += files[i].size;
        }
        if(isUploading) {
            return;
        }
        $('#uploadprogressbar').show();
        queueUploadLoop();
    }

    var uploadPercentage = 0;
    var queueUploadLoop = function() {
        if(uploadQueue.isEmpty() && uploadpathQueue.isEmpty()) {
            //종료
            return;
        }

        isUploading = true;
        var formData = new FormData();
        var item = 
        formData.append("path" , uploadpathQueue.dequeue());
        formData.append("files" , uploadQueue.dequeue());

        $.ajax({
            url : "/cloud/upload",
            type : "POST",
            enctype: 'multipart/form-data',
            data : formData,
            cache : false,
            headers : {"cache-control" : "no-cache"},
            processData : false,
            contentType : false,
            success : function(inputdata_str) {
                    var inputdata = JSON.parse(inputdata_str);
                    if(uploadQueue.isEmpty()) {
                        $('#uploadprogressbar')[0].style.setProperty('--width' , '0%');
                        $('#uploadprogressbar').attr('data-label' , '0%');
                        $('#uploadprogressbar').hide();
                        uploadSize = 0;
                        totalSize = 0;
                        isUploading = false;
                        curFileLoaded = 0;
                        uploadPercentage = 0;
                        alert('업로드 완료');
                        showfileframe();
                    }
                    else {
                        queueUploadLoop();
                    }
            },
            
            error : function () {
                    alert('에러발생');
            },
            xhr: function(){
                    var xhr = $.ajaxSettings.xhr() ;
                    // 프로그래스 이벤트
                    xhr.upload.onprogress = function(evt){ 
                        uploadPercentage = parseInt((uploadSize+evt.loaded)/totalSize*100);
                        if(uploadPercentage > 100) {
                            uploadPercentage = 100;
                        }
                        $('#uploadprogressbar')[0].style.setProperty('--width' , uploadPercentage +'%');
                        $('#uploadprogressbar').attr('data-label' , uploadPercentage +'%');
                        curFileLoaded = evt.loaded;
                    };
                    // 종료 이벤트
                    xhr.upload.onload = function(){ 
                        uploadSize += curFileLoaded;
                    };
                    // return the customized object
                    return xhr ;
            }
        });
    }
});


var showfileframe = function() {
    if(arguments[0]) {
        listtype = arguments[0];
    }
    $('#fileframe').attr('src' , "/cloud/fileframe?path=" + path + "&listtype=" + listtype);
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
}

var path = "";
window.addEventListener('message' , function(e) {
    var inputData = JSON.parse(e.data);
    var type = inputData['type'];
    switch(type) {
        case 'init' : 
            var data = inputData['data'];

            //변수 초기화
            path = data['path']
            used_storage = data['used_storage'];
            
            //프로그래스바 초기화
            $('.progress-bar').attr('data-label' , getVolumeSize(used_storage , 0) + '/' + getVolumeSize(max_storage , 0));
            $('.progress-bar')[0].style.setProperty('--width' , (used_storage / max_storage * 100) + '%');


            //파일프로임 타입버튼 초기화
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

var treeClear = function(path) {
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
    
    i = 0;
    while(i < curNode.children.length ) {
        if(curNode.children[i].ischecked) {
            curNode.children.splice(i , 1);
        }
        else {
            i++;
        }
    }
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
        if(curNode.children[i].name == file.fullname && curNode.children[i].type == file.type) {
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