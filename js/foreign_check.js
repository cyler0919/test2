function fgnCheck(rrn)  {// 외국인등록번호유효성검사. 
    var sum = 0;
    var sex = rrn.substr(6, 1);
    if (rrn.length != 13) {
        return false;
    } else if (sex < 5 || sex > 8) {
        return false;
    }

    if (Number(rrn.substr(7, 2)) % 2 != 0) {
        return false;
    }

    for (var i = 0; i < 12; i++) {
        sum += Number(rrn.substr(i, 1)) * ((i % 8) + 2);
    }

    if ((((11 - (sum % 11)) % 10 + 2) % 10) == Number(rrn.substr(12, 1))) {
        return true;
    }
    return false;
}
