/**
 * 옵션미리보기 스크립트
 * 기존 html/js/product_list.js를 개별디자인3에서 사용하기 위해 jquery화 시킴.
 * @auther duellist
 * @date 2011-06-16
 **/
var __option_preview_obj = {}; // 옵션 미리보기용 전역변수
function mk_prd_option_preview(uid, e) {
    jQuery.ajax({
        type: 'POST',
        url: '/shop/product_data.ajax.html',
        dataType: 'html',
        data: {
            'branduid': uid,
            'type': 'option'
        },
        success: function(req) {
            jQuery('#MK_opt_preview').html(req);
            return false;
        },
        errer: function() {
            alert('옵션정보 가져오기 실패');
        }
    });

    var _evt = e.currentTarget ? e.currentTarget : window.event.srcElement;
    var offset = ObjectPosition(_evt);
    __option_preview_obj = _evt;

    jQuery('#MK_opt_preview').css({
        'visibility': 'visible',
        'left': offset[0] + 'px',
        'top': offset[1] + 'px'
    });

    // window resize 이벤트 발생시 옵션 미리보기 위치를 다시 잡음
    jQuery(window).resize(function() {
        var _offset = ObjectPosition(__option_preview_obj);
        jQuery('#MK_opt_preview').css({
            'left': _offset[0] + 'px',
            'top': _offset[1] + 'px'
        });
    });
}
function ObjectPosition(obj) {
    var curleft = 0;
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }

    // 가운데 정렬때문에 추가함
    if (jQuery('#wrap').css('marginLeft') == 'auto') {
        curleft -= jQuery('#wrap').offset().left;
    }

    return [curleft,curtop];
}
