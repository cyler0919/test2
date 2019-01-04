// 문자열 trim
String.prototype.trim = function() {
    return this.replace(/(^\s+)|(\s+$)/g, '');
}

// 해당 스트링의 바이트수를 return
String.prototype.bytes = function() {
    var str = this;
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        len += (str.charCodeAt(i) > 128) ? 2 : 1;
    }
    return len;
}

// php number_format와 같은함수
String.prototype.number_format = function() {
    return this.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,');
}
Object.keys = Object.keys || (function () {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable('toString'),
        DontEnums = [ 
        'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
        'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
        ],
        DontEnumsLength = DontEnums.length;

        return function (o) {
            if (typeof o != 'object' && typeof o != 'function' || o === null) {
                return false;
            }

            var result = [];
            for (var name in o) {
                if (hasOwnProperty.call(o, name)) {
                    result.push(name);
                }
            }

            if (hasDontEnumBug) {
                for (var i = 0; i < DontEnumsLength; i++) {
                    if (hasOwnProperty.call(o, DontEnums[i]))
                        result.push(DontEnums[i]);
                }   
            }

            return result;
        };
})();

var validateBytes = function(obj) {
    var maxsize = 200;
    if (obj.value.bytes() > maxsize) {
        if (shop_language == 'eng') {
            alert("You have exceeded the maximum length. Please check that you entered a maximum of " + (maxsize / 2) + " korean characters or " + maxsize + " english letters/numbers/signs");
        } else {
            alert("옵션 입력 범위가 초과되었습니다.\n한번 더 확인해주세요\n" + "한글만" + (maxsize / 2) + "자 이내 혹은 영문/숫자/기호만 " + maxsize + "자 이내여야 가능합니다.");
        }
        return false;
    }
};

var validateNumeric = function(el) {
    if (el.value == '') { return false; }
    el.value = el.value.replace(/(\s)/g, '');
    var pattern = /(^[0-9]+$)/;
    if (!pattern.test(el.value)) {
        return false;
    }
    return true;
};

// 옵션별 재고
var optionStock = function(idx){
    if (typeof(stockInfo) == 'object') {
        return stockInfo[idx];
    }
}

// 선택한 옵션 리스트의 index 정보 or 데이터 길이
var GetOptionInfo = function() {
    var optionArr = document.getElementsByName('optionlist[]');
    var optionIndex = new Array();

    for (var i = 0; i < optionArr.length; i++) {
        if (optionArr[i].type == 'text') {
            optionIndex[i] = optionArr[i].value.trim().bytes();
        } else {
            optionIndex[i] = optionArr[i].selectedIndex - 1;
        }
    }
    return optionIndex;
};

/**
 * 옵션별 품절 여부 표기
 */
var changeOptvalue = function() {
    var optionobj = document.getElementById('option_type');
    if (optionobj == undefined) {
        return false;
    }
    var optionType  = optionobj.value;
    var optionIndex = optval = tempval = '';
    var optcnt = 0;
    var tmpok = new Array(10);
    var oki2 = -1;
    var oki;

    display_option_stock(optionType);

    if (shop_language == 'eng') {
        var soldout_txt = 'out of stock';
    } else {
        var soldout_txt = '품절';
    }
    if (optionType != 'PC') {
        var soldout_txt_length = soldout_txt.length + 3;//언어별 품절표기 문자열 길이 구한 후 앞 공백( 과 뒤 ) 3자리 더해준다.

        var optionArr = document.getElementsByName('optionlist[]');
        var optnum = optionArr.length;
        for (var i = 0; i < optnum; i++) {
            if (optionJsonData[i].mandatory == 'Y') {
                tmpok[optcnt++] = i;
                oki2 = i;
            }
        }
        if (optcnt == 1) {
            oki = tmpok[0];
            var num2 = optionArr[oki].length;
            for (var j = 0; j < num2; j++) {
                var len = optionArr[oki].options[j].text.length;
                if (optionArr[oki].options[j].text.substring(len-soldout_txt_length,len)==" ("+soldout_txt+")") optionArr[oki].options[j].text = optionArr[oki].options[j].text.substring(0,len-soldout_txt_length);
                if (optionStock(j - 1) == 0 && optionArr[oki].options[j].text.match(soldout_txt) == null) {
                    optionArr[oki].options[j].text += ' (' + soldout_txt + ')';
                    //optionArr[i].options[j].text = '품절된 제품입니다.';
                }
            }
        } else if (oki2 != -1) {
            for (i = 0; i < optcnt - 1; i++) {
                if (optionArr[tmpok[i]].selectedIndex <= 0) return;
                var tmpi = optionArr[tmpok[i]].selectedIndex;
                tempval = tempval + (tmpi - 1) + ',';
            }

            var num2 = optionArr[oki2].length;
            for (var j = 1; j < num2; j++) {
                optval = tempval + (j - 1);
                var len = optionArr[oki2].options[j].text.length;
                if (optionArr[oki2].options[j].text.substring(len-soldout_txt_length,len)==" ("+soldout_txt+")") optionArr[oki2].options[j].text = optionArr[oki2].options[j].text.substring(0,len-soldout_txt_length);
                if (optionStock(optval) == 0 && optionArr[oki2].options[j].text.match(soldout_txt) == null) {
                    optionArr[oki2].options[j].text += ' (' + soldout_txt + ')';
                    //optionArr[oki2].options[j].text = '품절된 제품입니다.';
                }
            }
        }
    }
};

/**
 * 옵션별 품절 여부 표기 - 세트상품
 */
var changeOptvalue_package = function() {
    var optionobj = document.getElementById('option_type');
    if (optionobj == undefined) {
        return false;
    }
    var optionType  = optionobj.value;
    var optionIndex = optval = tempval = '';
    var optcnt = 0;
    var tmpok = new Array(10);
    var oki2 = -1;
    var oki;

    if (shop_language == 'eng') {
        var soldout_txt = 'out of stock';
    } else {
        var soldout_txt = '품절';
    }
    if (optionType != 'PC') {
        var optionArr = document.getElementsByName('optionlist[]');
        var optnum = optionArr.length;
        for (var i = 0; i < optnum; i++) {
            if (optionJsonData[i].mandatory == 'Y') {
                tmpok[optcnt++] = i;
                oki2 = i;
            }
        }
        if (optcnt == 1) {
            oki = tmpok[0];
            var num2 = optionArr[oki].length;
            for (var j = 0; j < num2; j++) {
                var len = optionArr[oki].options[j].text.length;
                if (optionStock(j - 1) == 0 && optionArr[oki].options[j].text.match(soldout_txt) == null) {
                    optionArr[oki].options[j].text += ' (' + soldout_txt + ')';
                    //optionArr[i].options[j].text = '품절된 제품입니다.';
                }
            }
        } else if (oki2 != -1) {
            for (i = 0; i < optcnt - 1; i++) {
                if (optionArr[tmpok[i]].selectedIndex <= 0) return;
                var tmpi = optionArr[tmpok[i]].selectedIndex;
                tempval = tempval + (tmpi - 1) + ',';
            }

            var num2 = optionArr[oki2].length;
            for (var j = 1; j < num2; j++) {
                optval = tempval + (j - 1);
                var len = optionArr[oki2].options[j].text.length;

                if (optionStock(optval) == 0 && optionArr[oki2].options[j].text.match(soldout_txt) == null) {
                    optionArr[oki2].options[j].text += ' (' + soldout_txt + ')';
                    //optionArr[oki2].options[j].text = '품절된 제품입니다.';
                }
            }
        }
    }
};

var Set_TotalPrice = function(totalnum) {
    var totalprice = 0;
    var totaldisprice = 0;
    var totaldiscount = 0;
    var totalreserve = 0;
    var totalpoint = 0;
    var totalweight = 0;
    var package_reserve_unit = document.getElementById('package_reserve_unit').value;
    var package_point_unit = document.getElementById('package_point_unit').value;
    var package_weight_unit = document.getElementById('package_weight_unit').value;
    var package_dan = document.getElementById('package_dan').value;
    var package_cut = document.getElementById('package_cut').value;

    for (i = 0; i < totalnum; i++) {
        totalprice += parseInt(document.getElementById('package_price_hidden'+i).value, 10);
        totaldisprice += parseInt(document.getElementById('package_disprice_hidden'+i).value, 10);
        totalreserve += parseInt(document.getElementById('package_reserve'+i).value, 10);
        totalpoint += parseInt(document.getElementById('package_point'+i).value, 10);
        totalweight += parseFloat(document.getElementById('package_weight'+i).value);
    }

    totaldiscount = totalprice - totaldisprice;
    
    //세트할인가 절사 적용
    if (package_dan != "1" && package_dan.length > 0) {
        var dan_array = new Array();
        dan_array['1'] = 0.1;
        dan_array['0.1'] = 1;
        dan_array['0.01'] = 10;
        dan_array['0.001'] = 100;

        var package_dan2 = dan_array[package_dan];

        totaldiscount = eval("Math."+package_cut+"(totaldiscount * package_dan)") * (package_dan2 * 10);
        totaldisprice = totalprice - totaldiscount;
    }

    if (document.getElementById('package_reserve_total')) {
        document.getElementById('package_reserve_total').innerHTML = totalreserve.toString().number_format()+package_reserve_unit;
    }
	if (document.getElementById('package_point_total')) {
        document.getElementById('package_point_total').innerHTML = totalpoint.toString().number_format()+package_point_unit;
    }
	if (document.getElementById('package_weight_total')) {
        if (totalweight.toString().indexOf('.') > 0) { totalweight = Math.abs(totalweight.toFixed(3)); } 
        document.getElementById('package_weight_total').innerHTML = totalweight.toString().number_format()+package_weight_unit;
    }
    document.getElementById('product_total_price').innerHTML = totalprice.toString().number_format()+'원';
    document.getElementById('package_total_price').innerHTML = totaldisprice.toString().number_format()+'원';
    document.getElementById('discount_total_price').innerHTML = totaldiscount.toString().number_format()+'원';
};

// submit 할때 수량 및 필수체크                                                                                                        
// 고객 작성형인 경우 text 입력 길이 제한 추가해줘야함                                                                                 
var validateSubmit_pack = function(num) {                                                                                                  
    var optionType  = document.getElementById('package_option_type'+num).value;                                                                                      
    var maxsize = 200;                                                                                                                  
    var optionJson  = document.getElementById('package_JsonData'+num).value;                                                                                         
    var mandatory;    

    var dicker_pos      = document.getElementById('package_dicker_pos').value;

    // 회원가격 공개 처리
    if(dicker_pos == "Y") {
        alert(((shop_language == 'eng') ? 'Member Login after selection.' : '회원 로그인 후 선택 가능합니다.'));
        return false;
    } else if(dicker_pos == "P") {
        alert(((shop_language == 'eng') ? 'Order for the selected Set cannot be placed from the shopping cart. Contact your administrator.' : '선택하신 세트 상품은 장바구니에 담아 주문이 가능하지 않으니, 관리자에게 문의하세요.'));
        return false;
    }

    var optionInfo = GetOptionInfoPackage(num);                                                                                              
    for (var i = 0; i < optionInfo.length; i++) {                                                                                      
        mandatory = optionJson.substring(i,i+1);                                                                                       
        if (optionType == 'PC') {                                                                                                      
            if (optionInfo[i] > maxsize) {                                                                                             
                if (shop_language == 'eng') {                                                                                          
                    alert("You have exceeded the maximum length. Please check that you entered a maximum of " + (maxsize / 2) + " korean characters or " + maxsize + " english letters/numbers/signs");
                } else {
                    alert("옵션 입력 범위가 초과되었습니다.\n한번 더 확인해주세요\n" + "한글만" + (maxsize / 2) + "자 이내 혹은 영문/숫자/기호만 " + maxsize + "자 이내여야 가능합니다.");
                }   
                return false;
            }   
            if (mandatory == "Y" && (optionInfo[i] <= 0 || document.getElementById('package_optionlist'+num+'_'+i).value.trim() == '필수 입력')) {                        
                alert(((shop_language == 'eng') ? 'You did not enter the required option. Please enter an option.' : '필수옵션을 입력하지 않았습니다. 옵션을 입력해주세요'));
                document.getElementById('package_optionlist'+num+'_'+i).focus(); 
                return false;
            }
            if (document.getElementById('package_optionlist'+num+'_'+i).value.trim() == '선택 입력') {                                                                    
                document.getElementById('package_optionlist'+num+'_'+i).value = '';                                                                                  
            }                                                                                                                          
        } else {
            if (mandatory == "Y" && document.getElementById('package_optionlist' + num + '_' + i ).selectedIndex == 0) {                                             
                alert(((shop_language == 'eng') ? 'You did not enter the required option. Please enter an option.' : '필수옵션을 선택하지 않았습니다. 옵션을 선택해주세요'));
                document.getElementById('package_optionlist'+num+'_'+i).focus();                                                                                     
                return false;
            }   
        }
    }           
}

// 선택한 옵션에 따라 변경된 금액 처리
var priceCalculate = function(obj) {
    var regularPrice = parseInt(document.getElementById('regular_price').value.replace(/,/g, ''), 10);
    var discountPrice = parseInt(document.getElementById('discount_price').value.replace(/,/g, ''), 10);
    var quantity = parseInt(document.getElementById('goods_amount').value, 10);
    var optionType = document.getElementById('option_type').value;
    var optionPrice = 0;
    var optionIndex = '';
    var discountType = document.getElementById('discount_type').value;
    var optionDisPrice = 0;

    changeOptvalue();

    var optionInfo = GetOptionInfo();
    if (optionType != 'PC') {
        jQuery.each(optionInfo, function(idx, obj) {
            if (obj >= 0) {
                optionPrice += parseInt(optionJsonData[idx].price[obj], 10);
                if (discountType == true && optionType != 'PP' && optionJsonData[idx].disprice != undefined) {
                    optionDisPrice += parseInt(optionJsonData[idx].disprice[obj], 10);
                } else if (discountType == true && optionType != 'PP' && optionJsonData[idx].disprice == undefined) {
                    optionDisPrice += parseInt(optionJsonData[idx].price[obj], 10);
                }

                // 필수옵션인 경우에만 stock index 생성하도록함
                if (optionJsonData[idx].mandatory == 'Y') {
                    optionIndex += obj + ',';
                }
            }
        });
        optionIndex = optionIndex.replace(/,$/g, '');

        // 품절 체크
        if (optionStock(optionIndex) == 0) {
            alert(((shop_language == 'eng') ? 'The item of the selected option is out of stock. Please select another option.' : '선택하신 옵션은 품절입니다. 다른 옵션을 선택해주세요.'));
            obj.selectedIndex = 0;
            return false;
        }
    }

    // 옵션별 변동 금액 처리
    var totalPrice = regularPrice + optionPrice;
    //if(discountType == true && optionDisPrice > 0 ) { 마이너스 옵션일 때가 존재
	if(discountType == true) {
        var totaldisPrice = discountPrice + optionDisPrice;
    } else {
        var totaldisPrice = discountPrice + optionPrice;
    }

    if (document.getElementById('currency')) {
        var currency = totalPrice / parseInt(document.getElementById('currency').value, 10);
        document.getElementById('dollarprice').value = currency.toFixed(2);
    }

    // 옵션 종류에 따라 수량별 금액 계산이 다르다.
    var price_text = document.getElementById('price_text');
    var discount_text = document.getElementById('downpricevalue');

    if (optionType == 'PP') {
        if (price_text) {
            document.getElementById('price_text').innerHTML = ((regularPrice * quantity) + optionPrice).toString().number_format();
        }
        if (shop_language == 'eng' && document.getElementById('price_text_usd')) {
            var tmp_price = ((regularPrice * quantity) + optionPrice);
            var price_usd = tmp_price / exchange_rate;
            document.getElementById('price_text_usd').innerHTML = price_usd.toFixed(2);
        }
        if (discount_text && discountType == true) {
            document.getElementById('downpricevalue').innerHTML = ((discountPrice * quantity) + optionPrice).toString().number_format();
        }
        document.getElementById('price').value = ((regularPrice * quantity) + optionPrice).toString().number_format();
        if(discount_text && discountType == true){
            document.getElementById('disprice').value = ((discountPrice * quantity) + optionPrice).toString().number_format();
        }

    } else if (optionType != 'PC') {    // 고객작성형은 옵션적용가가 없음
        if (price_text) {
            document.getElementById('price_text').innerHTML = (totalPrice * quantity).toString().number_format();
        }
        if (shop_language == 'eng' && document.getElementById('price_text_usd')) {
            var tmp_price = (totalPrice * quantity);
            var price_usd = tmp_price / exchange_rate;
            document.getElementById('price_text_usd').innerHTML = price_usd.toFixed(2);
        }
        if (discount_text && discountType == true) {
            document.getElementById('downpricevalue').innerHTML = (totaldisPrice * quantity).toString().number_format();
        }
        document.getElementById('price').value = (totalPrice * quantity).toString().number_format();
        if (discount_text && discountType == true) {
            document.getElementById('disprice').value = (discountPrice * quantity).toString().number_format();
        }
    }
};

// 선택한 옵션에 따라 변경된 금액 처리 - 세트상품
var priceCalculate_package = function(obj, tmnum) {
    var optionType      = document.getElementById('package_option_type'+tmnum).value;
    if (optionType == 'NO') {
        var optionJsonData  = document.getElementById("package_option_jsondata"+tmnum).value;
    } else {
        var optionJsonData  = eval("("+document.getElementById("package_option_jsondata"+tmnum).value+")");
    }
    var regularPrice    = parseInt(document.getElementById('package_regular_price'+tmnum).value.replace(/,/g, ''), 10);
    var packageProdReserve  = parseInt(document.getElementById('package_prod_reserve'+tmnum).value.replace(/,/g, ''), 10);
    var packageProdPoint  = parseInt(document.getElementById('package_prod_point'+tmnum).value.replace(/,/g, ''), 10);
    var discountPrice   = parseInt(document.getElementById('package_discount_price'+tmnum).value.replace(/,/g, ''), 10);
    var quantity        = parseInt(document.getElementById('goods_amount').value, 10);
    var discountType    = document.getElementById('package_discount_type').value;
    var totalnum        = document.getElementById('package_num').value;
    var dicker_pos      = document.getElementById('package_dicker_pos').value;
    var optionPrice     = 0;
    var optionIndex     = '';
    var optionDisPrice  = 0;

    // 회원가격 공개 처리
    if(dicker_pos == "Y") {
        alert(((shop_language == 'eng') ? 'Member Login after selection.' : '회원 로그인 후 선택 가능합니다.'));
        obj.selectedIndex = 0;
        return false;
    } else if(dicker_pos == "P") {
        alert(((shop_language == 'eng') ? 'Order for the selected Set cannot be placed from the shopping cart. Contact your administrator.' : '선택하신 세트 상품은 장바구니에 담아 주문이 가능하지 않으니, 관리자에게 문의하세요.'));
        obj.selectedIndex = 0;
        return false;
    }



    changeOptvalue_package(tmnum);

    var optionInfo = GetOptionInfoPackage(tmnum);
    if (optionType != 'PC') {
        jQuery.each(optionInfo, function(idx, obj) {
            if (obj >= 0) {
                optionPrice += parseInt(optionJsonData[idx].price[obj], 10);
                if (discountType == 'DISCOUNT' && optionType != 'PP' && optionJsonData[idx].disprice != undefined) {
                    optionDisPrice += parseInt(optionJsonData[idx].disprice[obj], 10);
                }

                // 필수옵션인 경우에만 stock index 생성하도록함
                if (optionJsonData[idx].mandatory == 'Y') {
                    optionIndex += obj + ',';
                }
            }
        });
        optionIndex = optionIndex.replace(/,$/g, '');

        // 품절 체크
        if (SetoptionStock(optionIndex, eval('stockInfo'+tmnum)) == 0) {
            alert(((shop_language == 'eng') ? 'The item of the selected option is out of stock. Please select another option.' : '선택하신 옵션은 품절입니다. 다른 옵션을 선택해주세요.'));
            obj.selectedIndex = 0;
            return false;
        }
    }

    // 옵션별 변동 금액 처리
    var totalPrice = regularPrice + optionPrice;
    if (discountType == 'DISCOUNT' && optionDisPrice > 0 ) {
        //var totaldisPrice = discountPrice + optionDisPrice;
        var totalPrice = discountPrice + optionDisPrice;
    } else {
        //var totaldisPrice = discountPrice + optionPrice;
        var totalPrice = discountPrice + optionPrice;
    }

    if (document.getElementById('currency')) {
        var currency = totalPrice / parseInt(document.getElementById('currency').value, 10);
        document.getElementById('dollarprice').value = currency.toFixed(2);
    }

	// 판매가 할인율
	var packageConsumerprice      = (document.getElementById('package_consumerprice'+tmnum)) ? document.getElementById('package_consumerprice'+tmnum).value : 0;
	if (packageConsumerprice > 0 && document.getElementById('discount_percent_span'+tmnum)) {

		var packageOrgSellprice  = (document.getElementById('package_org_sellprice'+tmnum)) ? parseInt(document.getElementById('package_org_sellprice'+tmnum).value) : 0;
		packageOrgSellprice += optionPrice;

		if (packageOrgSellprice > 0) {
			var discount_percent = Math.round(100 - (packageOrgSellprice / packageConsumerprice * 100));
			document.getElementById('discount_percent_span'+tmnum).innerHTML = (discount_percent > 0) ? discount_percent : 0;
		}
	}

    // 옵션 종류에 따라 수량별 금액 계산이 다르다.
    var price_text = document.getElementById('price_text'+tmnum);
    var discount_text = document.getElementById('downpricevalue');

    if (optionType == 'PP') {
        if (price_text) {
            document.getElementById('price_text'+tmnum).innerHTML = ((regularPrice * quantity) + optionPrice).toString().number_format()+'원';
            document.getElementById('package_price_hidden'+tmnum).value = ((regularPrice * quantity) + optionPrice);
            document.getElementById('package_reserve'+tmnum).value = package_product_calc_reserve(((regularPrice * quantity) + optionPrice), packageProdReserve, quantity);
            document.getElementById('package_point'+tmnum).value = package_product_calc_point(((regularPrice * quantity) + optionPrice), packageProdPoint, quantity);
            package_product_calc_price(document.getElementById('package_price_hidden'+tmnum).value, tmnum); //세트할인

            if (shop_language == 'eng' && document.getElementById('price_text_usd')) {
                var tmp_price = ((regularPrice * quantity) + optionPrice);
                var price_usd = tmp_price / exchange_rate;
                document.getElementById('price_text_usd').innerHTML = price_usd.toFixed(2);
            }
        }
        if (discount_text && discountType == true) {
            document.getElementById('downpricevalue').innerHTML = ((discountPrice * quantity) + optionPrice).toString().number_format();
        }
        //document.getElementById('price').value = ((regularPrice * quantity) + optionPrice).toString().number_format();
        if(discount_text && discountType == true){
            document.getElementById('disprice').value = ((discountPrice * quantity) + optionPrice).toString().number_format();
        }

    } else if (optionType != 'PC') {    // 고객작성형은 옵션적용가가 없음
        if (price_text) {
            document.getElementById('price_text'+tmnum).innerHTML = (totalPrice * quantity).toString().number_format()+'원';
            document.getElementById('package_price_hidden'+tmnum).value = totalPrice * quantity;
            document.getElementById('package_reserve'+tmnum).value = package_product_calc_reserve((totalPrice * quantity), packageProdReserve, quantity);
            document.getElementById('package_point'+tmnum).value = package_product_calc_point((totalPrice * quantity), packageProdPoint, quantity);
            package_product_calc_price(document.getElementById('package_price_hidden'+tmnum).value, tmnum); //세트할인

            if (shop_language == 'eng' && document.getElementById('price_text_usd')) {
                var tmp_price = (totalPrice * quantity);
                var price_usd = tmp_price / exchange_rate;
                document.getElementById('price_text_usd').innerHTML = price_usd.toFixed(2);
            }
        }
        if (discount_text && discountType == true) {
            document.getElementById('downpricevalue').innerHTML = (totaldisPrice * quantity).toString().number_format();
        }
        //document.getElementById('price').value = (totalPrice * quantity).toString().number_format();
        if (discount_text && discountType == true) {
            document.getElementById('disprice').value = (discountPrice * quantity).toString().number_format();
        }
    }

    Set_TotalPrice(totalnum);
};

// whitesal
// 콤마 찍기
function comma(n) {
    if (isNaN(n))
        return 0;
    
    var reg = /(^[+-]?\d+)(\d{3})/;     // 정규식
    n += '';                            // 숫자를 문자열로 변환
    while (reg.test(n))
        n = n.replace(reg, '$1' + ',' + '$2');
        return n;
}

// 금액 변경후 문자열 리턴
function change_price_str(F_str, G_price, N_count) {
    if(!F_str || !G_price || !N_count)
        return;
     
        var F_str   = jQuery(F_str).html();
        var price_x = F_str.replace(/[^0-9]?/g,'');
        var firtstr = F_str.substr(0, F_str.indexOf(price_x.substring(0,1)));
        var laststr = F_str.substr(F_str.lastIndexOf(price_x.charAt(price_x.length-1))+1);
        var total_price = comma(G_price * N_count);
        var total_str = firtstr + total_price  + laststr;
        return total_str;
}

// 인풋박스 수량변경.
jQuery(document).ready(function(){
    jQuery("#goods_amount").change(function(){
        var amount = parseInt(document.getElementById('goods_amount').value);
        if(amount > 0) {
            document.getElementById('goods_amount').value = amount;
            amount = parseInt(document.getElementById('goods_amount').value);
            CountChange('no');
        }
    });
});

// 수량변경에 따라 변경된 금액 처리
var CountChange = function(type) {
    var amount = parseInt(document.getElementById('goods_amount').value);
    var _min   = parseInt(document.getElementById('miniq').value);
    var _max   = parseInt(document.getElementById('maxq').value);

    if (type == 'up') {
        amount += min_add_amount;
    } else if (type == 'down') {
        amount -= min_add_amount;
    }
    if (amount < _min) {
        alert(((shop_language == 'eng') ? 'The minimum purchase quantity is ' + _min : '해당상품은 최소 구매수량이 ' + _min + '개 입니다.'));
        amount = _min;
    }

    if (amount > _max) {
        alert(((shop_language == 'eng') ? 'The maximum purchase quantity is ' + _min : '해당상품은 최대 구매수량이 ' + _max + '개 입니다.'));
        amount = _max;
    }

    if (amount < 1) {
        amount = min_add_amount;
    }
    if (validateNumeric(document.getElementById('goods_amount')) == false) {
        amount = min_add_amount;
    }
    if ((amount % min_add_amount) != 0) {
         amount = Math.floor(amount / min_add_amount) * min_add_amount;
         if (amount == 0) amount = min_add_amount;
    }
    document.getElementById('goods_amount').value = amount;
    if (document.getElementById('regular_price') !== null) {
        priceCalculate('');
    }

    if(document.getElementById('option_type_wh')) {
        var optionobj = document.getElementById('option_type_wh').value;
    } 
    
    if (optionobj != 'NO' && optionobj != '') {
        return;
    }
    
    if(!document.getElementsByName('optionlist[]').length) {
        // 판매가격
        var price_value = document.getElementById('pricevalue');
        if(price_value) {
            var price = parseInt(document.getElementById('price_wh').value.replace(/,/g, ''), 10);
            var total_str = change_price_str(price_value, price, amount);
            if(total_str)
                price_value.innerHTML = total_str;
        }

        // 할인가격
        var dc_price_value = document.getElementById('change_discount_price_wh');
        if(dc_price_value) {
            var price = parseInt(document.getElementById('disprice_wh').value.replace(/,/g, ''), 10);
            var total_str = change_price_str(dc_price_value, price, amount);
            if(total_str)
                dc_price_value.innerHTML = total_str;
        }
    }
}

function count_change(cnt) {
    if (cnt > 0) {
        CountChange('down');
    } else {
        CountChange('up');
    }
}

// 수량변경에 따라 변경된 금액 처리 세트상품
var CountChange_package = function(type, total_package) {
    var amount = document.getElementById('goods_amount');
	var dicker_pos = document.getElementById('package_dicker_pos').value;

	// 회원가격 공개 처리
	if(dicker_pos == "Y") {
		alert(((shop_language == 'eng') ? 'Member Login after selection.' : '회원 로그인 후 선택 가능합니다.'));
		return;
	} else if(dicker_pos == "P") {
		alert(((shop_language == 'eng') ? 'Order for the selected Set cannot be placed from the shopping cart. Contact your administrator.' : '선택하신 세트 상품은 장바구니에 담아 주문이 가능하지 않으니, 관리자에게 문의하세요.'));
		return;
	}

	if (type == 'up') {
        amount.value++;
    } else if (type == 'down') {
        amount.value--;
    }
    if (amount.value < 1) {
        amount.value = 1;
    }
    if (validateNumeric(document.getElementById('goods_amount')) == false) {
        amount.value = 1;
    }

    for (var x = 0; x < total_package; x++) {
        if ($('package_option_type'+x)) {
            var optionArr = document.getElementsByName('package_optionlist'+x+'[]');
            
            for (var j = 0; j < optionArr.length; j++) {
                package_change_amount_price(this, x);
            }
        }
    }
}

//수량 변경시 금액 재계산 - 세트상품
var package_change_amount_price = function(obj, tmnum) {
    var optionType      = document.getElementById('package_option_type'+tmnum).value;
    if (optionType == 'NO') {
        var optionJsonData  = document.getElementById("package_option_jsondata"+tmnum).value;
    } else {
        var optionJsonData  = eval("("+document.getElementById("package_option_jsondata"+tmnum).value+")");
    }
    var regularPrice    = parseInt(document.getElementById('package_regular_price'+tmnum).value.replace(/,/g, ''), 10);
    var packageProdReserve  = parseInt(document.getElementById('package_prod_reserve'+tmnum).value.replace(/,/g, ''), 10);
    var packageProdPoint  = parseInt(document.getElementById('package_prod_point'+tmnum).value.replace(/,/g, ''), 10);
    var packageProdWeight = parseFloat(document.getElementById('package_prod_weight'+tmnum).value.replace(/,/g, ''));
    var discountPrice   = parseInt(document.getElementById('package_discount_price'+tmnum).value.replace(/,/g, ''), 10);
    var quantity        = parseInt(document.getElementById('goods_amount').value, 10);
    var discountType    = document.getElementById('package_discount_type').value;
    var totalnum        = document.getElementById('package_num').value;
    var optionPrice     = 0;
    var optionIndex     = '';
    var optionDisPrice  = 0;

    var optionInfo = GetOptionInfoPackage(tmnum);
    if (optionType != 'PC') {
        jQuery.each(optionInfo, function(idx, obj) {
            if (obj >= 0) {
                if (optionType == 'PS') {
                    if (optionJsonData[idx].disprice != undefined) {
                        optionPrice += parseInt(optionJsonData[idx].disprice[obj], 10);
                    } else {
                        optionPrice += parseInt(optionJsonData[idx].price[obj], 10);
                    }
                } else {
                    optionPrice += parseInt(optionJsonData[idx].price[obj], 10);
                }
                if(discountType == true && optionType != "PP") {
					//optionDisPrice += parseInt(optionJsonData[idx].disprice[obj], 10);
                    optionDisPrice += optionPrice;
				}

                // 필수옵션인 경우에만 stock index 생성하도록함
                if (optionJsonData[idx].mandatory == "Y") {
                    optionIndex += obj + ",";
                }
            }
        });
        optionIndex = optionIndex.replace(/,$/g, ''); 
    }

    // 옵션별 변동 금액 처리
    var totalPrice = regularPrice + optionPrice;
    if(discountType == true && optionDisPrice > 0 ) {
        //var totaldisPrice = discountPrice + optionDisPrice;
        var totalPrice = discountPrice + optionDisPrice;
	}else{
	   //var totaldisPrice = discountPrice + optionPrice;
	   var totalPrice = discountPrice + optionPrice;
	}

    if (document.getElementById('currency')) {
        var currency = totalPrice / parseInt(document.getElementById('currency').value, 10);
        document.getElementById('dollarprice').value = currency.toFixed(2);
    }

    // 옵션 종류에 따라 수량별 금액 계산이 다르다.
    var price_text = document.getElementById('price_text'+tmnum);
    var discount_text = document.getElementById('downpricevalue');
	
    if (optionType == "PP") {
        if (price_text) {
            document.getElementById('price_text'+tmnum).innerHTML = ((regularPrice * quantity) + optionPrice).toString().number_format()+'원';
            document.getElementById('package_price_hidden'+tmnum).value = ((regularPrice * quantity) + optionPrice);
            document.getElementById('package_reserve'+tmnum).value = package_product_calc_reserve(((regularPrice * quantity) + optionPrice), packageProdReserve, quantity);
            document.getElementById('package_point'+tmnum).value = package_product_calc_point(((regularPrice * quantity) + optionPrice), packageProdPoint, quantity);
            document.getElementById('package_weight'+tmnum).value = package_product_calc_weight((totalPrice * quantity), packageProdWeight, quantity);
            package_product_calc_price(document.getElementById('package_price_hidden'+tmnum).value, tmnum); //세트할인

            if (shop_language == 'eng' && document.getElementById('price_text_usd')) {
                var price_usd = totalPrice / document.getElementById('exchange_rate').value;
                document.getElementById('price_text_usd').innerHTML = '(&#36;'  + price_usd.toFixed(2) + ')';
            }
        }
        if(discount_text && discountType == true){
            document.getElementById('downpricevalue').innerHTML = ((discountPrice) + optionPrice).toString().number_format();
        }
        if(discount_text && discountType == true){
            document.getElementById('disprice').value = ((discountPrice * quantity) + optionPrice).toString().number_format();
        }

    } else if (optionType != 'PC' && optionType != 'NO') {    // 고객작성형은 옵션적용가가 없음
        if (price_text) {
            document.getElementById('price_text'+tmnum).innerHTML = (totalPrice * quantity).toString().number_format()+'원';
            document.getElementById('package_price_hidden'+tmnum).value = totalPrice * quantity;
            document.getElementById('package_reserve'+tmnum).value = package_product_calc_reserve((totalPrice * quantity), packageProdReserve, quantity);
            document.getElementById('package_point'+tmnum).value = package_product_calc_point((totalPrice * quantity), packageProdPoint, quantity);
            document.getElementById('package_weight'+tmnum).value = package_product_calc_weight((totalPrice * quantity), packageProdWeight, quantity);
            package_product_calc_price(document.getElementById('package_price_hidden'+tmnum).value, tmnum); //세트할인

            if (shop_language == 'eng' && document.getElementById('price_text_usd')) {
                var price_usd = totalPrice / document.getElementById('exchange_rate').value;
                document.getElementById('price_text_usd').innerHTML = '(&#36;'  + price_usd.toFixed(2) + ')';
            }
        }
        if(discount_text && discountType == true){
            document.getElementById('downpricevalue').innerHTML = (totaldisPrice).toString().number_format();
        }
        if(discount_text && discountType == true){
            document.getElementById('disprice').value = (discountPrice * quantity).toString().number_format();
        }
    } else if (optionType == "PC") {
        if (price_text) {
            document.getElementById('price_text'+tmnum).innerHTML = (totalPrice * quantity).toString().number_format()+'원';
            document.getElementById('package_price_hidden'+tmnum).value = totalPrice * quantity;
            document.getElementById('package_reserve'+tmnum).value = package_product_calc_reserve((totalPrice * quantity), packageProdReserve, quantity);
            document.getElementById('package_point'+tmnum).value = package_product_calc_point((totalPrice * quantity), packageProdPoint, quantity);
            document.getElementById('package_weight'+tmnum).value = package_product_calc_weight((totalPrice * quantity), packageProdWeight, quantity);
            package_product_calc_price(document.getElementById('package_price_hidden'+tmnum).value, tmnum); //세트할인
        }
    } else if (optionType == "NO") {
        if (price_text) {
            document.getElementById('price_text'+tmnum).innerHTML = (totalPrice * quantity).toString().number_format()+'원';
            document.getElementById('package_price_hidden'+tmnum).value = totalPrice * quantity;
            document.getElementById('package_reserve'+tmnum).value = package_product_calc_reserve((totalPrice * quantity), packageProdReserve, quantity);
            document.getElementById('package_point'+tmnum).value = package_product_calc_point((totalPrice * quantity), packageProdPoint, quantity);
            document.getElementById('package_weight'+tmnum).value = package_product_calc_weight((totalPrice * quantity), packageProdWeight, quantity);
            package_product_calc_price(document.getElementById('package_price_hidden'+tmnum).value, tmnum); //세트할인
        }
    }

    Set_TotalPrice(totalnum);
};

// submit 할때 수량 및 필수체크
// 고객 작성형인 경우 text 입력 길이 제한 추가해줘야함
var validateSubmit = function(temp, form, baskettype) { 
    var optionType  = document.getElementById('option_type').value;
    var maxsize = 200;

    if (validateNumeric(document.getElementById('goods_amount')) == false) {
        alert(((shop_language == 'eng') ? 'Please enter a minimum quantity of 1' : '수량을 1이상 입력해주세요.'));
        document.getElementById('goods_amount').focus();
        return false;
    }

    var optionInfo = GetOptionInfo();

    if (shop_language == 'eng') {
        var opt_required_txt = 'Required';
        var opt_select_txt   = 'Select';
    } else {
        var opt_required_txt = '필수 입력';
        var opt_select_txt   = '선택 입력';
    }

    for (var i = 0; i < optionInfo.length; i++) {
        if (optionType == 'PC') {
            if (optionInfo[i] > maxsize) {
                if (shop_language == 'eng') {
                    alert("You have exceeded the maximum length. Please check that you entered a maximum of " + (maxsize / 2) + " korean characters or " + maxsize + " english letters/numbers/signs");
                } else {
                    alert("옵션 입력 범위가 초과되었습니다.\n한번 더 확인해주세요\n" + "한글만" + (maxsize / 2) + "자 이내 혹은 영문/숫자/기호만 " + maxsize + "자 이내여야 가능합니다.");
                }
                return false;
            }

            if (optionJsonData[i].mandatory == 'Y' && (optionInfo[i] <= 0 || document.getElementById('optionlist_' + i).value.trim() == opt_required_txt)) {
                alert(((shop_language == 'eng') ? 'You did not enter the required option. Please enter an option.' : '필수옵션을 입력하지 않았습니다. 옵션을 입력해주세요'));
                jQuery('#optionlist_' + i).focus();
                return false;
            }
            if (document.getElementById('optionlist_' + i).value.trim() == opt_select_txt) {
                document.getElementById('optionlist_' + i).value = '';
            }
        } else {
            if (optionJsonData[i].mandatory == 'Y' && document.getElementById('optionlist_' + i ).selectedIndex == 0) {
                alert(((shop_language == 'eng') ? 'You did not enter the required option. Please enter an option.' : '필수옵션을 선택하지 않았습니다. 옵션을 입력해주세요'));
                document.getElementById('optionlist_' + i).focus();
                return false;
            }
        }
    }

    // 바로 구매
    if (temp == 'baro') {
        form.ordertype.value = 'baro';
        form.ordertype.value += '|parent.|layer';
        form.target = 'loginiframe';
    }else {
        form.ordertype.value = '';
        form.target = '';
    }
    if (baskettype == 'A' && temp != 'check') {
        form.ordertype.value += '|parent.|layer';
        form.target = 'loginiframe';
    } else if (baskettype == 'Y' && temp != 'check') {
        form.ordertype.value += '|parent.';
        form.target = 'loginiframe';
    }

    // 페이코 간편구매
    if (document.getElementById('direct_order') && document.getElementById('direct_order').value == 'payco_checkout') {
        if (typeof MOBILE_USE != 'undefined' && MOBILE_USE == 1) {
            form.target = "";
        }
        else {
            window.open('', 'payco_win', 'width=692');
            form.target = "payco_win";
        }
    }

    if (temp != 'check') {
        if (typeof m_acecounter_use !== 'undefined' && m_acecounter_use === true && typeof ACM_PRODUCT == 'function') {
            ACM_PRODUCT(form.amount.value);
            setTimeout(function () { form.submit(); }, 100);
        } else {
            form.submit();
        }
    }
};

var wishvalidateSubmit = function(temp, form, baskettype, mobileuse) {
    var optionType = document.getElementById('option_type').value;
    var maxsize = 200;
    var optionIndex = '';

    var optionInfo = GetOptionInfo();

    if (shop_language == 'eng') {
        var opt_required_txt = 'Required';
        var opt_select_txt   = 'Select';
    } else {
        var opt_required_txt = '필수 입력';
        var opt_select_txt   = '선택 입력';
    }

    // wish 에 담을때는 필수체크 안함
    for (var i = 0; i < optionInfo.length; i++) {
        if (optionType == 'PC') {
            if (document.getElementById('optionlist_' + i).value.trim() == opt_select_txt || document.getElementById('optionlist_' + i).value.trim() == opt_required_txt) {
                document.getElementById('optionlist_' + i).value = '';
            }
            if (optionInfo[i] > maxsize) {
                if (shop_language == 'eng') {
                    alert("You have exceeded the maximum length. Please check that you entered a maximum of " + (maxsize / 2) + " korean characters or " + maxsize + " english letters/numbers/signs");
                } else {
                    alert("옵션 입력 범위가 초과되었습니다.\n한번 더 확인해주세요\n" + "한글만" + (maxsize / 2) + "자 이내 혹은 영문/숫자/기호만 " + maxsize + "자 이내여야 가능합니다.");
                }
                return false;
            }
        } else {
            optionIndex += optionInfo[i] + ',';
        }		
    }

    if (baskettype == 'A' && temp != 'check') {
        form.ordertype.value += '|parent.|layer';
        form.target = 'loginiframe';
    } else if (baskettype == 'Y' && temp != 'check') {
        form.ordertype.value += '|parent.';
        form.target = 'loginiframe';
    }
    form.mode.value = 'wish';
    form.optioncode.value = optionIndex;
    if(mobileuse == 'Y') {
        form.action = '../../index.html';
    } else {
        form.action = '../../shop/shopdetail.html';
    }
    if (temp != 'check') form.submit();
};

// 선택한 옵션 리스트의 index 정보 or 데이터 길이
var GetOptionInfoPackage = function(num) {
    var optionArr = document.getElementsByName('package_optionlist'+num+'[]');
    var optionIndex = new Array(); 

    for (var i = 0; i < optionArr.length; i++) {
        if (optionArr[i].type == 'text') {
            optionIndex[i] = optionArr[i].value.trim().bytes();
        } else {
            optionIndex[i] = optionArr[i].selectedIndex - 1;
        }
    }
    return optionIndex;
};

//옵션 가격 변경에 따른 세트상품 할인 계산
var package_product_calc_price = function(org_price, tmnum) {
    var discount_type   = document.getElementById('package_discount_type').value;
    var discount_money  = document.getElementById('package_discount_money').value;
    var goods_amount    = document.getElementById('goods_amount').value;
    var discount_price  = 0;

    if (discount_type == "DISCOUNT") {
        if (discount_money < 0) {
            discount_price = Math.ceil(org_price - (org_price * ((discount_money * -1) / 100)));
        } else {
            discount_price = org_price - (discount_money * goods_amount);
        }
    } else {
        discount_price = org_price;
    }

    document.getElementById('package_disprice_hidden'+tmnum).value = discount_price;
}

//세트 구성 상품 적립금 계산
var package_product_calc_reserve = function(price, reserve, quantity) { 
    var package_product_reserve = 0;
    var cal_cut = document.getElementById('reservecut').value;
    var cal_dan = document.getElementById('reservedan').value;
    var cal_dan2 = document.getElementById('reservedan2').value;

    if (reserve != 0) {
        if (reserve < 0) {
            switch (cal_cut) {
                case 'floor' :
                    package_product_reserve = Math.floor(price * (Math.round(reserve * -1) / 100) * cal_dan) * (cal_dan2 * 10);
                    break;
                case 'ceil' :
                    package_product_reserve = Math.ceil(price * (Math.round(reserve * -1) / 100) * cal_dan) * (cal_dan2 * 10);
                    break;
                case 'round' :
                    package_product_reserve = Math.round(price * (Math.round(reserve * -1) / 100) * cal_dan) * (cal_dan2 * 10);
                    break;
            }
        } else {
            package_product_reserve = reserve * quantity;
        }
    }

    return package_product_reserve;
}

var package_product_calc_point = function(price, point, quantity) { 
    var package_product_point = 0;

    if (point != 0) {
        if (point < 0) {
            package_product_point = Math.floor(price * (Math.round(point * -1) / 100) * 1) * (0.1 * 10);
        } else {
            package_product_point = point * quantity;
        }
    }

    return package_product_point;
}

var package_product_calc_weight = function(price, weight, quantity) { 
    var package_product_weight = 0;

    if (weight != 0) {
        package_product_weight = weight * quantity;
    }

    return package_product_weight;
}
// 세트상품 옵션별 재고
var SetoptionStock = function(idx, stockInfo){
    if (typeof(stockInfo) == 'object') {
        return stockInfo[idx];
    }
}
