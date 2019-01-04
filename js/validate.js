function sizefilter(maxsize, language) {
    if (typeof language == 'undefined') {
        language = 'kor';
    }
    var obj = event.srcElement;

    if (obj.value.bytes() > maxsize) {
        if (language != 'kor') {
            alert_msg = "Tolerance limits has been exceeded.\nPlease check one more time.\nEnglish / numbers / symbols can only be " + maxsize + "characters or less.";
        } else {
            alert_msg = "허용 범위가 초과되었습니다.\n한번 더 확인해주세요\n한글만" + maxsize/2 + "자 이내 혹은 영문/숫자/기호만 " + maxsize + "자 이내여야 가능합니다.";
        }
        alert(alert_msg);
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
        alert("인터넷 옵션에서 쿠키를 삭제하시고 다시 시도해주세요.");
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
    return document.cookie.substring(offset, endStr);
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
    alert("삭제 되었습니다.");
}
