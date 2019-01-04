(function($) {
    // css �����ͼ� ó����
    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", '../../css/multi_image.css');

    if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }

    var nowCode = '',
    nowOrder = 0;

    $.extend({
        // �̹��� ��ΰ� �߸� �Ǿ����� ��� ó��
        imageError : function(obj) {
            obj.src = '../../images/mini.gif';
            $.btnPosition();
        },
        // �����̹��� ����ó��
        imageShow : function() {
            num = 0;

            if (Items[num].images.length) {
                nowCode = num;
                nowOrder = 0;

                $('ul#detail_multi_image').append('<li><a href="javascript:;"><img src="'+Items[num].images[0]+'" alt="'+Items[num].desc+'" id="detail_viewimage" onerror="jQuery.imageError(this);" onload="jQuery.btnPosition();" /></a></li>').end().fadeIn();
            } else {
                alert('�� �̹����� �����ϴ�.');
                return false;
            }
        },
        // ��ư �̹��� ���� �������� ���� ��ġ ó��
        btnPosition : function() {
            $('#detailpage .thumb-img .btn-prev, #detailpage .thumb-img .btn-next').css('height', $('img#detail_viewimage').height());
        }
    });

    $(document).on('click', '#detailpage a.btn-prev', function() {
        if (nowOrder > 0) {
            nowOrder--;
            if (Items[nowCode].images[nowOrder] == undefined) {
                return false;
            }
            $('ul#detail_multi_image > li > a').html('<img src="'+Items[nowCode].images[nowOrder]+'" alt="'+Items[nowCode].desc+'"  id="detail_viewimage" onerror="jQuery.imageError(this);" onload="jQuery.btnPosition();" />');

        } else {
        }
        return false;
    });
    $(document).on('click', '#detailpage a.btn-next', function() {
        _max = Items[nowCode].images.length - 1;
        if (nowOrder < _max) {
            nowOrder++;
            if (Items[nowCode].images[nowOrder] == undefined) {
                return false;
            }
            $('ul#detail_multi_image > li > a').html('<img src="'+Items[nowCode].images[nowOrder]+'" alt="'+Items[nowCode].desc+'" id="detail_viewimage" onerror="jQuery.imageError(this);" onload="jQuery.btnPosition();"  />');
        }
        return false;
    });
})(jQuery);
