function product_compare(productcd, max_prd) {
    //alert(document.cookie);
    var name = "prdComp";   //쿠키에 저장될 이름
    if(!max_prd > 0) {
        max_prd = 4;    //최대 저장될 비교 상품 수가 넘어오지 않을 경우 기본값으로 4개를 등록할 수 있다.
    }
    var cookie_value = getCookieInfomation(name);
    if(cookie_value == "overflow") {
        return;
    } else if(cookie_value == null) {
        setCookieInfomation(name, productcd);
        alert("첫번째 상품을 선택하셨습니다.\n비교할 상품을 선택해 주세요!");
    } else {
        //등록된 상품이 있을 경우 같은 상품코드가 아닐 경우 뒤에 추가한다.
        var prdCode_len = 0;    //등록된 상품 코드 배열 인수 초기화
        var check = 0;      //등록되어 있는 상품인지 확인할 구분 값 초기화
        prdCode = new Array();  //컴마로 구분된 상품 코드를 분리하여 저장하기 위한 배열 초기화
        prdCode = cookie_value.split(",");
        prdCode_len = prdCode.length;
        for(var i = 0; i < prdCode_len; i++) {
            if(prdCode[i] == productcd) {
                //이미 등록이 되어 있는 상품인 경우
                alert("이미 등록되어 있는 상품코드 입니다.");
                check = 0;
                return;
            } else {
                //등록이 되어 있지 않은 경우
                check = 1;
            }
        }
        if(prdCode_len >= max_prd) {
            var over_code = confirm("비교상품은 " + max_prd + "개 이상 등록할 수 없습니다. 지금 삭제하시겠습니까?");
            if (over_code) {
                go_compare(over_code);
                return;
            } else {
                return;
            }
        }
        if(check) {
            productcd = cookie_value + "," + productcd;
            setCookieInfomation(name, productcd);
            var prdNum = prdCode_len + 1;
            var go_check = confirm(prdNum + "번째 상품을 선택하셨습니다.\n선택한 상품을 비교하시겠습니까?");
            go_compare(go_check);
        }
    }
}
function delCompPrd(val) {
    var name = "prdComp";
    delCookieInfomation(name, val);
    location.reload();
}
function compare_imgcheck() {
    var obj = event.srcElement;
    var width = obj.width;
    if(width > 120) {
        obj.width="120";
    }
}
function go_compare(val) {
    if(val) {
        //location.href = "shopprdcompare.html";
        window.open("shopprdcompare.html","compare_prd","scrollbars=no,status=no,menubar=no,toolbar=no");
        return;
    } else {
        return;
    }
}
function go_url(url){
    opener.location.href=url;
}
