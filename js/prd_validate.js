function product_compare(productcd, max_prd) {
    //alert(document.cookie);
    var name = "prdComp";   //��Ű�� ����� �̸�
    if(!max_prd > 0) {
        max_prd = 4;    //�ִ� ����� �� ��ǰ ���� �Ѿ���� ���� ��� �⺻������ 4���� ����� �� �ִ�.
    }
    var cookie_value = getCookieInfomation(name);
    if(cookie_value == "overflow") {
        return;
    } else if(cookie_value == null) {
        setCookieInfomation(name, productcd);
        alert("ù��° ��ǰ�� �����ϼ̽��ϴ�.\n���� ��ǰ�� ������ �ּ���!");
    } else {
        //��ϵ� ��ǰ�� ���� ��� ���� ��ǰ�ڵ尡 �ƴ� ��� �ڿ� �߰��Ѵ�.
        var prdCode_len = 0;    //��ϵ� ��ǰ �ڵ� �迭 �μ� �ʱ�ȭ
        var check = 0;      //��ϵǾ� �ִ� ��ǰ���� Ȯ���� ���� �� �ʱ�ȭ
        prdCode = new Array();  //�ĸ��� ���е� ��ǰ �ڵ带 �и��Ͽ� �����ϱ� ���� �迭 �ʱ�ȭ
        prdCode = cookie_value.split(",");
        prdCode_len = prdCode.length;
        for(var i = 0; i < prdCode_len; i++) {
            if(prdCode[i] == productcd) {
                //�̹� ����� �Ǿ� �ִ� ��ǰ�� ���
                alert("�̹� ��ϵǾ� �ִ� ��ǰ�ڵ� �Դϴ�.");
                check = 0;
                return;
            } else {
                //����� �Ǿ� ���� ���� ���
                check = 1;
            }
        }
        if(prdCode_len >= max_prd) {
            var over_code = confirm("�񱳻�ǰ�� " + max_prd + "�� �̻� ����� �� �����ϴ�. ���� �����Ͻðڽ��ϱ�?");
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
            var go_check = confirm(prdNum + "��° ��ǰ�� �����ϼ̽��ϴ�.\n������ ��ǰ�� ���Ͻðڽ��ϱ�?");
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
