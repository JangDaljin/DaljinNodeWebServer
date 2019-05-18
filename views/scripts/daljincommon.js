var getVolumeSize = function(size , deter) {    
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