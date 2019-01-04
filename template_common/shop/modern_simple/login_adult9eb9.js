$('.input-text').focusin(function(){
    if ( $(this).val() == '' ){
        $(this).siblings('label').hide();
    }
}).focusout(function(){
    if ( $(this).val() == '' ){
        $(this).siblings('label').show();
    }
});
$('.guide-text').click(function() {
  if ($(this).parent().find('input').val() == '') {
      $(this).hide();
      $(this).parent().find('input').focus();
  }
});