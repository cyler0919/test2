/**
 * ÄíÅ°°ª ÃßÃâ
 * @param cookie_name ÄíÅ°¸í
 */
function getCookie(cookie_name) {
    var cookie = document.cookie;
    if (cookie.length > 0) {
        start_pos = cookie.indexOf(cookie_name);
        if (start_pos != -1) {
            start_pos += cookie_name.length;
            end_pos = cookie.indexOf(';', start_pos);
            if (end_pos == -1) {
                end_pos = cookie.length;
            }
            return unescape(cookie.substring(start_pos + 1, end_pos));
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * ÄíÅ° ¼³Á¤
 * @param cookie_name ÄíÅ°¸í
 * @param cookie_value ÄíÅ°°ª
 * @param expireDay ÄíÅ° À¯È¿³¯Â¥
 */
function setCookie(cookie_name, cookie_value, expire_date, domain) {
    var today = new Date();
    var expire = new Date();
    expire.setTime(today.getTime() + 3600000 * 24 * expire_date);
    cookies = cookie_name + '=' + escape(cookie_value) + '; path=/;';

    if (domain != undefined) {
        cookies += 'domain=' + domain +  ';';
    }  else if (document.domain.match(/www\./) != null) {
        cookies += 'domain=' + document.domain.replace('www.','') + ';';
    }
    if (expire_date != 0) cookies += 'expires=' + expire.toGMTString();

    document.cookie = cookies;
}

/**
 * ÄíÅ° »èÁ¦
 * @param cookie_name »èÁ¦ÇÒ ÄíÅ°¸í
 */
function deleteCookie(cookie_name) {
    var expire_date = new Date();
    expire_date.setDate(expire_date.getDate() - 1);
    document.cookie = cookie_name + '=' + '; expires=' + expire_date.toGMTString() + '; path=/';
}
