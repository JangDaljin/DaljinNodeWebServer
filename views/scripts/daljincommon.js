var getVolumeSize = function(size , deter) {
    size += "";
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



