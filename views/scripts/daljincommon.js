$(document).ready(function () {
        //session check
        $.ajax({
                url : "/sessioncheck",
                type : "GET",
                data : {},
                contentType : "application/json",
                cache : false,
                async : true,
                headers : {"cache-control" : "no-cache"},
                success : function (inputdata_jsonstr) {
                        var inputdata = JSON.parse(inputdata_jsonstr);
                        if(inputdata['result']) {
                                $('.naver_login').hide();
                                $('#btn_logout').css('display' , 'flex');
                        }
                        
                        else {
                                $('.naver_login').css('display' , 'flex');
                                $('#btn_logout').hide();
                        }
                                
                },
                error : function () {
                        
                }
        });

        //LOGOUT
        $('#btn_logout').click(function (e) {
                $.ajax({
                        url : "/logout",
                        type : "POST",
                        data : {},
                        contentType : "application/json",
                        cache : false,
                        async : true,
                        headers : {"cache-control" : "no-cache"},
                        success : function (inputdata_jsonstr) {
                                var inputdata = JSON.parse(inputdata_jsonstr);
                                if(inputdata['error']) {
                                        alert("로그아웃 실패");
                                }
                                else {
                                        window.location.href="/";
                                }
                        },
                        error : function () {
                                alert('에러발생');
                        }
                });
        });
});

var getVolumeSize = function(size , deter) {
        if(typeof(size) != "number") {
                return typeof(size);
        }
        size = parseInt(size);
        if(size / 1024 > 1) {                           
                return getVolumeSize(size / 1024 , deter+1);  
        } else {                                        
                var res = '';                                   
                switch(deter) {                                 
                        case 0 :                                
                                res = 'Byte';                              
                                break;                                  
                        case 1 :                                        
                                res = 'KB';                             
                                break;                                  
                        case 2 :                                        
                                res = 'MB';                             
                                break;                                  
                        case 3 :                                        
                                res = 'GB';                             
                                break;                                  
                        case 4 :                                        
                                res = 'TB';                             
                                break;                                 
                        default :                                       
                                res = "NaN";                            
                                break;                                  
                }  
                if(res=='Byte') {
                        return size.toFixed(0)+res;  
                }
                else {
                        return size.toFixed(2)+res;  
                }
        }                                             
};



$(document).ready(function () {
        var dropZone = $('#d_div');

        dropZone.on('dragover' , function(e) {
                e.stopPropagation();
                e.preventDefault();
                $(this).css('border' , '3px dashed blue');
        });
        dropZone.on('dragleave' , function(e) {
                e.stopPropagation();
                e.preventDefault();
                $(this).css('border' , '3px dashed black');
        });
        dropZone.on('drop' , function(e) {
                e.stopPropagation();
                e.preventDefault();
                console.dir(e.originalEvent.dataTransfer.files);
        });
});

function Queue(){
        this.datas = [];
}

Queue.prototype.isEmpty = function(){
        return this.datas.length==0?true:false;
}

Queue.prototype.length = function(){
        return this.datas.length;
}

Queue.prototype.enqueue = function(element){
        this.datas.push(element);
}

Queue.prototype.dequeue = function(){
        element = this.peek();
        this.datas.shift();
        return element;
}

Queue.prototype.peek = function(){
        element = this.datas[0]==undefined?null:this.datas[0];
        return element;
}

Queue.prototype.toArray = function(){
        return this.datas;
}

Queue.prototype.clear = function(){
        this.dats = [];
}

