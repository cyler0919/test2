/* ���� ��ȭ�� */

(function($) {
$(function () {

    $(".tab_content").hide();
    $(".tab_content:first").show();

    $("ul.tabs li").click(function () {
        $("ul.tabs li").removeClass("active").css("color", "#777");
        $(this).addClass("active").css("color", "#000");
        $(".tab_content").hide()
        var activeTab = $(this).attr("rel");
        $("#" + activeTab).fadeIn()
    });
});
})(jQuery);









/* ���� ��ȭ�� ����Ʈ��ǰ ���� */

(function($) {
$(".prolist_info_box").hide();

$(".tab_content .box").hover(function(){
$(this).find(".prolist_info_box").fadeIn('fast');

},function(){
$(this).find(".prolist_info_box").hide();
});
})(jQuery);










/* ��� ī�װ� ���� */

(function($){

    $.fn.floatTitle = function(options) {
        options = $.extend({}, $.fn.floatTitle.defaults , options);
        
        return this.each(function() {
            var aPosition = $("#wrap").position();
			//alert(navigator.appName.charAt(0))
            var node = this;
            $(node).css({"position":"relative",'width':'1200px','margin-left':'auto','margin-right':'auto','top':'0px','z-index':1000});
            $(window).scroll(function() {   
				$(document).scrollTop()
                var _top = $(document).scrollTop();
				
				if(_top > 216){ //��ܿ��� ���ȼ� �������� �������� �����ϴ� ����
				
						if($(node).css("position") == "fixed"){
					   $(node).css({"position":"fixed",'left': $("#wrap").offset().left  + 'px','margin-left':'auto','margin-right':'auto','top':'35px','z-index':1000});
						}else{
					   $(node).css({"position":"fixed",'left': $("#wrap").offset().left + 'px','margin-left':'auto','margin-right':'auto','top':'35px','z-index':1000});
						//$('#topbar2').fadeIn();
						$('#cateline').css({'width':'100%','background':'#fff'});
						}
				
				}else{
				$(node).css({"position":"relative",'width':'1200px','margin-left':'auto','margin-right':'auto','top':'0px','z-index':1000});	
				//$('#topbar2').hide();
				}	
				
            });
        });
    };

    $.fn.floatTitle.defaults = { 
        'animate'  : 500,
        'delay'    : 500
    };

})(jQuery);

(function($) {
//cate �����̴� �ҽ�
	$("#cateline").css({"position":"relative",'width':'100%','margin-left':'auto','margin-right':'auto','top':'0px','z-index':1000});
    //cate ������
	$("#cateline").floatTitle();
})(jQuery);











/* ��ũ��ž */

$(function(){
	$("#pageTop").click(function(){
		$('html,body').animate({scrollTop:$("#wrap").offset().top -40 }, 700); return false;
	});
});



(function($){
	$(document).ready(function(){
		$(window).scroll(function(){ // ��ũ���� ���۵Ǿ�����
			var position = $(window).scrollTop(); //���� ��ũ�� ��ġ���� ����
			if (position > 100){ //���� ��ũ�� ��ġ�� 100���� �� �����������
				$("#pageTop").fadeIn(); //ž��ư���� ���°� �����ش�.
			}else{
				$("#pageTop").fadeOut(); //ž��ư���� ���°� ��������Ѵ�.
			}//end if
		});
		$("#pageTop a.topbtn").click(function(){  //ž��ư�� Ŭ���Ұ��
			$("html, body").animate({scrollTop:0}, "fast(200)"); //�������� �ֻ������ �̵��Ѵ�. 
			return false;
		})
	});//end
})(jQuery)










/* �����޼��� */

function blockError(){return true;} 
window.onerror = blockError; 










/* �ѿ��� */

function na_restore_img_src(name, nsdoc)
{
  var img = eval((navigator.appName.indexOf('Netscape', 0) != -1) ? nsdoc+'.'+name : 'document.all.'+name);
  if (name == '')
    return;
  if (img && img.altsrc) {
    img.src    = img.altsrc;
    img.altsrc = null;
  } 
}

function na_preload_img()
{ 
  var img_list = na_preload_img.arguments;
  if (document.preloadlist == null) 
    document.preloadlist = new Array();
  var top = document.preloadlist.length;
  for (var i=0; i < img_list.length-1; i++) {
    document.preloadlist[top+i] = new Image;
    document.preloadlist[top+i].src = img_list[i+1];
  } 
}

function na_change_img_src(name, nsdoc, rpath, preload)
{ 
  var img = eval((navigator.appName.indexOf('Netscape', 0) != -1) ? nsdoc+'.'+name : 'document.all.'+name);
  if (name == '')
    return;
  if (img) {
    img.altsrc = img.src;
    img.src    = rpath;
  } 
}










 /* �׵θ� */

function bluring(){
if(event.srcElement.tagName=="A"||event.srcElement.tagName=="IMG") document.body.focus();
}
document.onfocusin=bluring;





