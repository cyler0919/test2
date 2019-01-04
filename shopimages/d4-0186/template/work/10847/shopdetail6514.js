/*

 <!--
/*------------------------------------------------------------------------------------------
// 화면 로드 후 처리
------------------------------------------------------------------------------------------*/
window.onload = function()
 {
  // div height 설정
 setDivHeight('div_content','div_left');
 }


 /*------------------------------------------------------------------------------------------
 // div height 설정
// objSet : 변경할 div id
 // objTar : height값을 구할 대상 div id
 ------------------------------------------------------------------------------------------*/
 function setDivHeight(objSet, objTar)
 { 
   var objSet   = document.getElementById(objSet); 
   var objTarHeight= document.getElementById(objTar).offsetHeight;
   objSet.style.height  = objTarHeight + "px";
 } 
 //-->

*/