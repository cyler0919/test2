/*
우측 배너 다중생성을 위한 스크립트.
2009-02-11, 이승환
*/

// 디버깅시에 무한루프에 빠져서 무한 alert이 되는걸 강제로 막는 스크립트. 사용시에 함수끝에 ();를 붙이면 활성화 됨.
(function() {
    window._alert = window.alert;
    window.alert = function(s) {
        var f = arguments.callee;
        if (f.ignore) return;
        f.count = (new Date().getTime() - f.last < 500) ? f.count + 1 : 0;
        if (f.count >= 5) {
            if (confirm('앞으로 alert 무시?')) f.ignore = true;
            f.count = 0;
        }

        var r;
        if (!f.ignore) r = window._alert(s);
        f.last = new Date().getTime();
        return r;
    };
    window.alert.count = 0;
    window.alert.last = 0;
})();

var isDOM = (document.getElementById ? true : false);
var isNS4 = (document.layers ? true : false);
var isNS  = navigator.appName == "Netscape";
var userAgent   = navigator.userAgent;

var cherrypicker_check = false;
/*
buffer      : 현재 js로 넘어온 원본 데이터를 그대로 가지고 있다. [ BannerID//filename||subject||leftmenu,BannerID... ]
entity      : 현재 js로 넘어온 데이터를 분해하여 배열정보로 가지고 있다.
moveInfo    : 각각의 레이어를 동시에 움직이는 효과를 가지기 위해 onresize시에 버퍼 역할을 한다. WindReset() 참조.
offset_left : makebanner의 offsetLeft 를 구할 수 없을때 getOffsetLeft 를 통해서 구해내는데 이때에 필요한 전역변수
offset_obj  : offset_left 와 동일한 목적
*/
var buffer, entity;
var moveInfo = new Array();
var offset_left	= 0;
var offset_obj = document.getElementById('makebanner');
var banner_position_type = 'LEFT';

if (offset_obj == null && banner_position_type) {
    offset_obj = document;
}

var fixed_first	= 0;
// makebanner의 위치를 구할 수 없는 상황에서..
/*
function getOffsetLeft(obj) {
    var left = 0;
    if (obj.offsetParent.tagName.toLowerCase() != 'body') {
        left = getOffsetLeft(obj.offsetParent);
    }
    return left + offset_obj.offsetLeft;
};

function getOffsetTop(obj) {
    var top = 0;
    if (obj.offsetParent.tagName.toLowerCase() != 'body') {
        top = getOffsetTop(obj.offsetParent);
    }
    return top + offset_obj.offsetTop;
};
*/
// 위 주석처리한 부분과 비슷하면서도...틀리네...
function getOffsetLeft(element) {
    var valueL = 0;
    if (document.getElementById('dgnset_wrap') != null && banner_position_type == 'CENTER') {
        element = document.getElementById('dgnset_wrap');
    }
    if (element == document) {
        if (banner_position_type == 'CENTER') {
            valueL = element.body.clientWidth / 2;
        }
    } else {
        do {
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
    }
    if (document.getElementById('dgnset_wrap') != null && banner_position_type == 'CENTER') {
        valueL += document.getElementById('dgnset_wrap').style.width ? parseInt(document.getElementById('dgnset_wrap').style.width) / 2 : 0;
    }

    return valueL;
}

function getOffsetTop(element) {
    var valueT = 0;
    do {
        valueT += element.offsetTop || 0;
        element = element.offsetParent;
    } while (element);
    return valueT;
}

// 최초로 데이터를 받는 함수. 레이어를 호출할때에 이 함수로 데이터만 넘겨주면 된다.
function BannerHandler(row) {
    var data = Array();
    var row_tmp = row.split(',');
    buffer = row;
    HandlerData();

    // 프레임셋을 사용하며 안드로이드 젤리빈에서 onresize가 무한루프돌기에 사용하지 않도록 처리함
    if (top.frames.topmenu == undefined || !userAgent.match(/Android/i)) {
        window.onresize = WindReset;
    }
    WindReset();

    for (var i = 0; i < moveInfo.length; i++) {
        if (moveInfo[i]['leftmenu'] == 'G') {
            var y = moveInfo[i]['henum'] - fixed_first;
            new move_type_2(document.getElementById(moveInfo[i]['bannerid']), y, moveInfo[i]['henum']);
        }
    }
}

// ID만 배열로 리턴한다.
function HandlerIdArr() {
    var data = Array();
    var ids = Array();
    var row_tmp = buffer.split(',');
	
    for (var i = 0; i < row_tmp.length; i++) {
        data[i] = row_tmp[i].split('//');
        ids[i] = data[i][0];
    }
    return ids;
}

// 데이터를 쪼개서 전역변수에 배열형태로 등록해둔다. BannerHander()가 호출되면서 한번만 실행된다.
function HandlerData() {
    var data = Array();
    var field = Array();
    var row_tmp = buffer.split(',');
    for (var i = 0; i < row_tmp.length; i++) {
        data[i] = row_tmp[i].split('//');
        field[i] = data[i][1].split('||');
    }
    entity = field;
    return field;
}

function getHeightNum(size) {
    if (typeof getCookiefss == 'function') {
        if (getCookiefss('yahoofss') == 'yahoo') {
            henum = parseInt(size) + 43;
        } else if (getCookiefss('refurl') == 'auction_open') {
            henum = parseInt(size) + 45;
        } else henum = size;
    } else henum = size;
    return parseInt(henum);
}

function WindReset() {
    var bannerid = HandlerIdArr();
    for (var i = 0; i < bannerid.length; i++) {
        var henum = getHeightNum(entity[i][0]);
        var obj = document.getElementById(bannerid[i]);
        var leftOffs;

        if (obj === null) {
            return false;
        }

        if (isNS4) {
            bannerid[i].top = top.pageYOffset + henum;
            bannerid[i].visibility = 'visible';
            if (entity[i][2] == 'Y') MoveRightBanner();
        } else if (isDOM) {
            var objVisibility = "visible";
            if(entity[i][0] == " " || entity[i][0] == "" ) {
                objVisibility = "hidden";
                entity[i][0] = 0;
                henum = getHeightNum(entity[i][0]);
            }
            if(entity[i][1] == " " || entity[i][1] == "" ) {
                objVisibility = "hidden";
                entity[i][1] = 0;
            }

            if (document.getElementById('makebanner') == null) {
                var mol	= document.body.offsetLeft;
            } else {
                var mol	= document.getElementById('makebanner').offsetLeft;
            }

            obj.style.top = (entity[i][2] == 'N' || entity[i][2] == '' || entity[i][2] == 'undefined') ? henum + 'px' : parseInt(getOffsetTop(offset_obj)) + henum + 'px';

            if (mol == 'undefined' || mol == '' || mol == 0) {
                leftOffs = parseInt(getOffsetLeft(offset_obj)) + parseInt(entity[i][1]);
            } else {
                leftOffs = parseInt(mol) + parseInt(entity[i][1]);
            }

            obj.style.left = leftOffs + 'px';
            obj.style.visibility = objVisibility;
            moveInfo[i] = new Array();
            moveInfo[i]['bannerid'] = bannerid[i];
            moveInfo[i]['henum'] = henum;
            moveInfo[i]['leftmenu'] = entity[i][2];
        } // endif
    } // endfor
    get_henum_minimum();
    MoveRightBanner();
    if (cherrypicker_check == false) {
        cherrypicker_check = true;
    } else {
        if (typeof load_cherrypicker != 'undefined') {
            load_cherrypicker();
        }
    }
}

// henum 중 가장 작은 값을 구해둔다.
function get_henum_minimum() {
    var h = Array();
    var j = 0;
    for (var i = 0; i < moveInfo.length; i++) {
        if (moveInfo[i]['leftmenu'] == 'G') {
            h[j] = moveInfo[i]['henum'];
            j++;
        }
    }
    fixed_first_tmp = h.sort(function(a, b) { return a-b; });
    fixed_first = fixed_first_tmp[0];
    return true;
}

function getScrollXY() {
    var scrOfX = 0, scrOfY = 0;
    if (typeof(window.pageYOffset) == 'number') {
        //Netscape compliant
        scrOfY = window.pageYOffset;
        scrOfX = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        //DOM compliant
        scrOfY = document.body.scrollTop;
        scrOfX = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        //IE6 standards compliant mode
        scrOfY = document.documentElement.scrollTop;
        scrOfX = document.documentElement.scrollLeft;
    }
    return [scrOfX, scrOfY];
}

function MoveRightBanner() {
    var yMenuFrom, yMenuTo, yOffset, timeoutNextCheck;
    for (var i = 0; i < moveInfo.length; i++) {
        if (moveInfo[i]['leftmenu'] == 'Y') {
            var bannerid = moveInfo[i]['bannerid'];
            var henum = parseInt(moveInfo[i]['henum']);
            var scroll_offset = getScrollXY();

            if (isNS4) {
                yMenuFrom = bannerid.top;
            } else if (isDOM) {
                yMenuFrom = parseInt(document.getElementById(bannerid).style.top,10);
            }

            yMenuTo = scroll_offset[1] + henum;

            timeoutNextCheck = 30;
            if (yMenuFrom != yMenuTo) {
                yOffset = Math.ceil(Math.abs(yMenuTo - yMenuFrom) / 20);

                if (yMenuTo < yMenuFrom) {
                    yOffset = -yOffset;
                }

                if (isNS4) {
                    bannerid.top += yOffset;
                } else if (isDOM) {
                    document.getElementById(bannerid).style.top = parseInt(document.getElementById(bannerid).style.top, 10) + yOffset + 'px';
                    timeoutNextCheck = 10;
                }
            }
        } // endif
    } // endfor
    setTimeout("MoveRightBanner()", timeoutNextCheck);
}

function setCookiedis(cookieName, cookieValue, nDays) {
    var today = new Date();
    var expire = new Date();
    expire.setTime(today.getTime() + 3600000 * 24 * nDays);
    cookie_temp = cookieName + '=' + escape(cookieValue) + '; path=/;';
    if (nDays != 0) cookie_temp += 'expires=' + expire.toGMTString();
    document.cookie = cookie_temp;
}

function dischange() {
    if (document.all) {
        disname = document.all('lastviewdiv').style;
    } else if (document.getElementById) {
        disname = document.getElementById('lastviewdiv').style;
    } else if (document.layers) {
        disname = document.layers['lastviewdiv'];
    }

    if (disname.display == 'none') {
        disname.display = 'block';
        setCookiedis('disname', 0, 0);
    } else {
        disname.display = 'none';
        setCookiedis('disname', 'Y', 0);
    }
}

function minihanashopfree(shopfree_id, shopfree_dir) {
    if (shopfree_id.length == 10) {
        if (shopfree_dir == 'Y') {
            window.open('http://www.hanaNplaza.com/loading.do?hnp=003&goods_cd=009&cohnp_cd=' + shopfree_id);
        } else {
            location.href = 'shop/hana_shopfree.html';
        }
    }
}

function move_type_2(obj, scrollY, topY) {
    this.obj = obj;
    this.scrollY = (scrollY) ? scrollY : 0;
    this.topY = (topY) ? topY : 0;
    this.obj.style.position = 'absolute';
    this.Body = null;
    this.setTimeOut = null;
    this.Run();
}

move_type_2.prototype.Run = function() {
    if (document.documentElement.scrollTop > document.body.scrollTop) {
        this.Body = document.documentElement;
    } else {
        this.Body = document.body;
    }

    var This = this;
    var objTop = (this.obj.style.top) ? parseInt(this.obj.style.top, 10) : this.obj.offsetTop;
    var top = this.Body.scrollTop;
    //var top = this.Body.scrollTop + this.scrollY; 체리피커와 같이 사용할 경우 최근 본 상품이 위아로래 계속 이동함
    var moveY = Math.abs(objTop - top);

    if (top > this.topY) {
        if (objTop < top) {
            this.obj.style.top = objTop + Math.ceil(moveY / 2) + 'px';
        } else {
            this.obj.style.top = top + 'px';
        }
    } else {
        this.obj.style.top = this.topY + 'px';
    }

    window.clearTimeout(this.setTimeOut);
    this.setTimeOut = window.setTimeout( function () { This.Run(); }, 10 );
}
