$(document).ready(function () {
    $('.checkbox').click(function() {
        if($(this).children('.uncheck').css('display') == 'none') {
            $(this).children('.uncheck').css('display' , 'inline-block');
            $(this).children('.check').css('display' , 'none');
        }
        else {
            $(this).children('.uncheck').css('display' , 'none');
            $(this).children('.check').css('display' , 'inline-block');
        }
    });

    $('.lt-li').dblclick(function() {
        var itemId = $(this).attr('id');
        var itemPos = parseInt(itemId.substring(itemId.lastIndexOf('_')+1 , itemId.length));

        if(files[itemPos]['type'] == 'directory') {
            window.location.href = "?path=" + encodeURIComponent(path + "/" + files[itemPos]['fullname']) +
                                    "&listtype=" + listtype;
        }
    });

});