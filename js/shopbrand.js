if (typeof shop_language == 'undefined') {
    var shop_language = 'kor';
}

function sizefilter(maxsize) {
    var obj = event.srcElement;

    if (obj.value.bytes() > maxsize) {
        if (shop_language == 'eng') {
            alert("You have exceeded the maximum length. Please check that you entered a maximum of " + maxsize/2 + " korean characters or " + maxsize + " english letters/numbers/signs.");
        } else {
            alert("허용 범위가 초과되었습니다.\n한번 더 확인해주세요\n" + "한글만" + maxsize/2 + "자 이내 혹은 영문/숫자/기호만 " + maxsize + "자 이내여야 가능합니다.");
        }
        obj.value = obj.value.cut(maxsize);
        obj.focus();
    }
}
function setCookieInfomation(name,value) {
    document.cookie = name + "=" + value + ";";
    //alert(document.cookie);
}
function getCookieInfomation(name) {
    var arg = name + "=";   //가져울 쿠키 정보의 명칭
    var arg_len = arg.length;   //가져올 쿠키 정보 명칭의 길이 체크
    var cookie_len = document.cookie.length;
    var cookie_size = document.cookie.bytes();  //현재 저장된 쿠키의 길이 체크 (최대 4096까지 저장가능)
    var i = 0;
    if(cookie_size > 4000) {
        alert(((shop_language == 'eng') ? "Please delete cookies in the options of your internet brower and try again" : "인터넷 옵션에서 쿠키를 삭제하시고 다시 시도해주세요."));
        return overflow;
    }
    while(i < cookie_len) {
        var j = i + arg_len;    //읽어야 할 명칭의 끝부분 위치 설정
        //이름과 매치되는 쿠키 명칭 찾기
        if(document.cookie.substring(i, j) == arg) {
            return getCookieVal(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;    //공백부분의 위치를 찾고 +1을 하여 다음 항목 시작위치 조정
        if(i == 0) break;
    }
    return null;
}
function getCookieVal(offset) {
    var endStr = document.cookie.indexOf (";", offset);     //offset(명칭 뒤 "=") 다음 부터 ";" 표시까지의 값 위치 지정
    if (endStr == -1)
        endStr = document.cookie.length;

    var val = document.cookie.substring(offset, endStr); 
    if (val == "") {
        val = null;
    }
    return val;
}
function delCookieInfomation(name, val) {
    if((val == null) || (val.length == 0)) {
        document.cookie = name + "=";
    } else {
        var next_val = "";
        var j = 0;      //처음 입력 값을 확인하기 위한 변수 초기화
        var cookie_value = getCookieInfomation(name);
        var prdCode_len = 0;    //등록된 상품 코드 배열 인수 초기화
        prdCode = new Array();  //컴마로 구분된 상품 코드를 분리하여 저장하기 위한 배열 초기화
        prdCode = cookie_value.split(","); 
        prdCode_len = prdCode.length;
        for(var i = 0; i < prdCode_len; i++) {
            if(prdCode[i] != val) {
                //중복되는 코드가 아닌 경우 코드 생성 
                if(j == 0) {
                    next_val = prdCode[i];
                } else {
                    next_val = next_val + "," + prdCode[i];
                }
                j++;
            } else {
                //중복되는 코드가 맞는 경우 코드 처리 위한 j 값 처리
                //아래의 경우가 없으면 i 가 0 인 상태에서 처리될 경우 그 다음 값 앞에 , 가 표시된다.
                if(i == 0) {
                   j = 0;
                } 
            }
        }
        setCookieInfomation(name, next_val);
    }
    alert(((shop_language == 'eng') ? "Deleted." : "삭제 되었습니다."));
}
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
        alert(((shop_language == 'eng') ? "You have selected the first product.\nPlease select a product to compare." : "첫번째 상품을 선택하셨습니다.\n비교할 상품을 선택해 주세요!"));
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

                // 상품이 2개이상 들어있는 경우 - 창을 한번 더 띄운다?!
                if (prdCode_len > 1) {
                    var go_check = confirm(((shop_language == 'eng') ? 'This product code is already selected.\nPlease select a product to compare.' : '이미 등록되어 있는 상품코드 입니다.\n선택한 상품을 비교하시겠습니까?'));
                    go_compare(go_check);
                } else {
                    alert(((shop_language == 'eng') ? "This product code is already selected." : "이미 등록되어 있는 상품코드 입니다."));
                    check = 0;
                }
                return;
            } else {
                //등록이 되어 있지 않은 경우
                check = 1;
            }
        }
        if(prdCode_len >= max_prd) {
            var over_code = confirm(((shop_language == 'eng') ? ("You can not compare more than " + max_prd + " products. Would you like to delete it?") : ("비교상품은 " + max_prd + "개 이상 등록할 수 없습니다. 지금 삭제하시겠습니까?")));
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
            var go_check = confirm(((shop_language == 'eng') ? ("You have selected the " + prdNum+ "th product.\nWould you like to compare products?") : (prdNum + "번째 상품을 선택하셨습니다.\n선택한 상품을 비교하시겠습니까?")));
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
String.prototype.cut = function(len) {
    var str = this;
    var l = 0;
    for (var i=0; i<str.length; i++) {
        l += (str.charCodeAt(i) > 128) ? 2 : 1;
        if (l > len) return str.substring(0,i);
    }
    return str;
}

String.prototype.bytes = function() {
    var str = this;
    var l = 0;
    for (var i=0; i<str.length; i++) l += (str.charCodeAt(i) > 128) ? 2 : 1;
    return l;
}
