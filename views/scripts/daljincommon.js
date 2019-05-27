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

var getVolumeSize = function(_size , deter) {
        size = parseInt(_size);

        if(isNaN(size)) {
                return typeof(size);
        }

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

var YYYYMMDD = function(_year , _month , _date , split) {
        var year = parseInt(_year);
        var month = parseInt(_month);
        var date = parseInt(_date);

        if(year == "NaN" || month == "NaN" || date == "NaN") {
                return null;
        }

        var res = "";

        //year
        if(year >= 0 && year < 10) {
                res += "000";
        }
        else if(year >= 10 && year < 100) {
                res += '00';
        }
        else if(year >= 100 && year < 1000) {
                res += '0';
        }
        else if(year >= 1000 && year < 10000) {
                
        }
        else {
                return null;
        }
        res += year;

        //split
        if(split) {
                res += split;
        }

        //month
        if(month < 10) {
                res += '0';
        }
        else if(month > 12 || month < 1) {
                return null;
        }
        res += month;

        //solit
        if(split) {
                res += split;
        }

        //date
        if(date < 10 && date > 0) {
                res += '0';
        }
        else if(date > 28 && month == 2) {
                //윤년
                if(date == 29 && year % 4 == 0 && ( !(year % 100 == 0) || year % 400 == 0)) {
                        // true
                }
                else {
                        return null;
                }
        }
        else if(date == 31 && (month == 4 || month == 6 || month == 9 || month == 11)){
                return null;
        }
        else if(date > 31) {
                return null;
        }

        res += date;
        return res;
}

var getByteLength = function(str) {

        if(typeof(str) != "string") {
                return null;
        }

        var b,i,c = null;
        for(b=i=0; c=str.charCodeAt(i++); b+=c>>15?4:c>>11?3:c>>7?2:1);
        return b;
}