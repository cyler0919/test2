/*

 <!--
/*------------------------------------------------------------------------------------------
// ȭ�� �ε� �� ó��
------------------------------------------------------------------------------------------*/
window.onload = function()
 {
  // div height ����
 setDivHeight('div_content','div_left');
 }


 /*------------------------------------------------------------------------------------------
 // div height ����
// objSet : ������ div id
 // objTar : height���� ���� ��� div id
 ------------------------------------------------------------------------------------------*/
 function setDivHeight(objSet, objTar)
 { 
   var objSet   = document.getElementById(objSet); 
   var objTarHeight= document.getElementById(objTar).offsetHeight;
   objSet.style.height  = objTarHeight + "px";
 } 
 //-->

*/