function sizefilter(maxsize, language) {
    if (typeof language == 'undefined') {
        language = 'kor';
    }
    var obj = event.srcElement;

    if (obj.value.bytes() > maxsize) {
        if (language != 'kor') {
            alert_msg = "Tolerance limits has been exceeded.\nPlease check one more time.\nEnglish / numbers / symbols can only be " + maxsize + "characters or less.";
        } else {
            alert_msg = "��� ������ �ʰ��Ǿ����ϴ�.\n�ѹ� �� Ȯ�����ּ���\n�ѱ۸�" + maxsize/2 + "�� �̳� Ȥ�� ����/����/��ȣ�� " + maxsize + "�� �̳����� �����մϴ�.";
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
    var arg = name + "=";   //������ ��Ű ������ ��Ī
    var arg_len = arg.length;   //������ ��Ű ���� ��Ī�� ���� üũ
    var cookie_len = document.cookie.length;
    var cookie_size = document.cookie.bytes();  //���� ����� ��Ű�� ���� üũ (�ִ� 4096���� ���尡��)
    var i = 0;
    if(cookie_size > 4000) {
        alert("���ͳ� �ɼǿ��� ��Ű�� �����Ͻð� �ٽ� �õ����ּ���.");
        return overflow;
    }
    while(i < cookie_len) {
        var j = i + arg_len;    //�о�� �� ��Ī�� ���κ� ��ġ ����
        //�̸��� ��ġ�Ǵ� ��Ű ��Ī ã��
        if(document.cookie.substring(i, j) == arg) {
            return getCookieVal(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;    //����κ��� ��ġ�� ã�� +1�� �Ͽ� ���� �׸� ������ġ ����
        if(i == 0) break;
    }
    return null;
}
function getCookieVal(offset) {
    var endStr = document.cookie.indexOf (";", offset);     //offset(��Ī �� "=") ���� ���� ";" ǥ�ñ����� �� ��ġ ����
    if (endStr == -1)
        endStr = document.cookie.length;
    return document.cookie.substring(offset, endStr);
}
function delCookieInfomation(name, val) {
    if((val == null) || (val.length == 0)) {
        document.cookie = name + "=";
    } else {
        var next_val = "";
        var j = 0;      //ó�� �Է� ���� Ȯ���ϱ� ���� ���� �ʱ�ȭ
        var cookie_value = getCookieInfomation(name);
        var prdCode_len = 0;    //��ϵ� ��ǰ �ڵ� �迭 �μ� �ʱ�ȭ
        prdCode = new Array();  //�ĸ��� ���е� ��ǰ �ڵ带 �и��Ͽ� �����ϱ� ���� �迭 �ʱ�ȭ
        prdCode = cookie_value.split(","); 
        prdCode_len = prdCode.length;
        for(var i = 0; i < prdCode_len; i++) {
            if(prdCode[i] != val) {
                //�ߺ��Ǵ� �ڵ尡 �ƴ� ��� �ڵ� ���� 
                if(j == 0) {
                    next_val = prdCode[i];
                } else {
                    next_val = next_val + "," + prdCode[i];
                }
                j++;
            } else {
                //�ߺ��Ǵ� �ڵ尡 �´� ��� �ڵ� ó�� ���� j �� ó��
                //�Ʒ��� ��찡 ������ i �� 0 �� ���¿��� ó���� ��� �� ���� �� �տ� , �� ǥ�õȴ�.
                if(i == 0) {
                   j = 0;
                } 
            }
        }
        setCookieInfomation(name, next_val);
    }
    alert("���� �Ǿ����ϴ�.");
}
