/* ���� ��Ŭ�� ����Ʈ */

$(".prolist_info_box").hide();

$(".box").hover(function(){
$(this).find(".prolist_info_box").fadeIn('fast');

},function(){
$(this).find(".prolist_info_box").hide();
});