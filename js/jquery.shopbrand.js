/*
 * shopbrand 분류구매 관련 스크립트
 * 범위 : 통합옵션 무옵션, 기본옵션만 지원
 */

var StringBuffer = function() {
    this.buffer = new Array();
};

StringBuffer.prototype.append = function(str) {
    this.buffer[this.buffer.length] = str;
};

StringBuffer.prototype.toString = function() {
    return this.buffer.join('');
};

String.prototype.numeric = function() {
    return parseInt(this.replace(/[^-0-9]/g, '') || 0, 10);
};
Number.prototype.numeric = function() {
    return this.toString().numeric();
};

String.prototype.number_format = function() {
    return this.numeric().toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
};
Number.prototype.number_format = function() {
    return this.toString().number_format();
};

if (typeof shop_language == 'undefined') {
    var shop_language = 'kor';
}

function object_count(obj) {
    var cnt = 0;
    for (var i in obj) {
        cnt++;
    }
    return cnt;
}

;(function($) {
    // shopbrand list_buy
    window.option_manager_list = {
        info : [[]],
        data: {
            basic: []
        },

        // return min amount
        get_min_amount: function(idx) {
            return this.info[idx].min_amount.numeric();
        },

        // return min add amount
        get_min_add_amount: function(idx) {
            return this.info[idx].min_add_amount.numeric();
        },

        // return min amount
        get_max_amount: function(idx) {
            return this.info[idx].max_amount.numeric();
        },

        // comma
        comma : function(n) {
            if (isNaN(n)) return 0;
            var reg = /(^[+-]?\d+)(\d{3})/;
            n += '';
            while (reg.test(n))
                n = n.replace(reg, '$1' + ',' + '$2');
            return n;
        },

        // remove comma
        remove_comma : function(n) {
            //if (isNaN(n)) return 0;
            n = n.replace(/\,/g,'');
            return n;
        },

        change_price_str : function(F_str, G_price, N_count) {
            if(!F_str || !G_price || !N_count) return;
            var total_price = this.comma(G_price * N_count);

            return total_price;
        },

        // loop list, input data
        set_info : function(param) {
            var _idx = param['idx'].numeric(); // product idx
            setTimeout(function() {
                var MOBILE_USE = $("input[name=MOBILE_USE]", $("form[name=product_form]")).val();
            },5);

            if (param === undefined) {
                param = new Array();
            }

            // info save
            this.info[_idx] = param;

            // data save
            this.init_self(_idx);

            // Mobile Not Use Tag Remove 
            if (MOBILE_USE == 'YES' || MOBILE_USE == 1) {
                // 모바일에서 @checkbox 비활성화 -> 수량element는 없으므로 수량조정버튼의 클래스 비워줌.
                // @checkbox, @amount, @link_amount_up, @link_amount_down 없으면 수량은 미노출
                var MS_product_checkbox_node = $(".MS_product_checkbox").eq(_idx); // 체크박스
                var _amount_ctrl_tags        = $(".MK_qty-ctrl a", $("#MS_product ul dl").eq(_idx)); // 수량
                var is_MS_product_checkbox_node = true; // 체크박스유무
                var is_amount_ctrl_tag          = true; // 수량조정링크 여부
                var is_amount_tag               = true; // 수량여부
                var amount_ctrl_tag_cnt         = 0;    // 수량조정 링크태그(2개 필)

                // @checkbox
                // 비활성화 및 태그 없으면 수량 미노출
                if ($(MS_product_checkbox_node).attr('class') == undefined || $(MS_product_checkbox_node).attr('disabled') == 'disabled' || true == $(MS_product_checkbox_node).attr('disabled')) {
                    is_MS_product_checkbox_node = false;
                }

                if ($(".MK_qty-ctrl", $("#MS_product ul dl").eq(_idx)) != undefined) {
                    // @amount_link
                    // 수량조정링크값이 2개 모두 없으면 수량 미노출
                    $.each(_amount_ctrl_tags, function(_a, _b) {
                        if ($(_b).attr('href').indexOf('set_amount_list') != -1) {
                            amount_ctrl_tag_cnt++;
                        }
                    });
                    if (amount_ctrl_tag_cnt != 2) {
                        is_amount_ctrl_tag = false;
                    }
                }

                // @amount
                // 수량태그 없으면 미노출
                if ($("#MS_amount_basic_list_" + _idx) == undefined || $("#MS_amount_basic_list_" + _idx).attr('id') == undefined || false === is_amount_ctrl_tag) {
                    is_amount_tag = false;
                }

                if (false == (is_MS_product_checkbox_node && is_amount_ctrl_tag && is_amount_tag)) {
                    if ($(".MK_qty-ctrl", $("#MS_product ul dl").eq(_idx)).attr('class') != undefined) {
                        $(".MK_qty-ctrl", $("#MS_product ul dl").eq(_idx)).empty();
                    }
                }
            }
        },

        // product option/data init setting
        init_self : function(idx) {
            var _this = this;
            var _info = _this.info[idx];
            if (_info == undefined) {
                return false;
            }

            // no option, basic option
            if (_info !== undefined && _info.idx !== undefined) {
                // no option data setting
                if (_info.option_type == 'NO' || ($.inArray(_info.optionJsonData, Array(undefined, null)) === -1 && object_count(_info.optionJsonData.basic) == 1 && (_info.optionJsonData.basic[0][0].opt_value === undefined || _info.optionJsonData.basic[0][0].opt_value == ''))) {
                    _this.data.basic[idx] = new Array({
                        opt_id      : _info.optionJsonData.basic[0][0].opt_ids || '0',
                        opt_value   : _info.product_name,
                        opt_stock   : _this.get_min_amount(idx),
                        opt_price   : 0,
                        sto_id      : _info.optionJsonData.basic[0][0].sto_id || '0'
                    });
                    _info.optionJsonData.basic[0][0].opt_value = product_name;
                } else {
                    // basic option
                    _this.data.basic[idx] = [];
                }
            } else {
                // other option init
                _this.data.basic[idx] = [];
            }
        },

        // check product total count
        // include : total quantity count
        check_product : function() {
            var _target   = $("#select_product_amount");
            var prd_nodes = $('.MS_product_checkbox');
            var prd_count = 0;
            var ids = [];

            if (prd_nodes.length > 0) {
                $.each(prd_nodes, function() {
                    if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                        prd_count++;
                        ids.push($(this).val());
                    }
                });
            }

            // exist element
            if (_target != undefined) {
                if ($(_target).attr('id') != undefined) {
                    $(_target).text(prd_count);
                }
            }

            // check product total quantity count
            this.set_product_quantity();
        },

        // 상품리스트 선택상품 총 수량
        set_product_quantity : function() {
            var _target   = $("#select_product_quantity");
            var prd_nodes = $('.MS_product_checkbox');
            var prd_quantity = 0;
            var _this = this;

            // 선택한 상품의 수량의 합계
            if (prd_nodes.length > 0) {
                $.each(prd_nodes, function() {
                    if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                        var amount_obj = $("#MS_amount_basic_list_" + $(this).val());

                        // 수량태그없으면 최소주문수량들어감
                        if ($(amount_obj).val() == undefined || $(amount_obj).val() == '' || $(amount_obj).val().length < 1) {
                            prd_quantity = prd_quantity + parseInt( _this.info[$(this).val()].min_amount );
                        } else {
                            prd_quantity = prd_quantity + parseInt($(amount_obj).val());
                        }
                    }
                });
            }

            // 선택상품 총 수량 element있는 경우 추가
            if (_target != undefined) {
                if ($(_target).attr('id') != undefined) {
                    $(_target).text(prd_quantity);
                }
            }

            // 선택상품 총 금액
            _this.calculate_product_price();
        },

        // 상품리스트 선택상품 총 금액
        calculate_product_price : function() {
            var _target   = $("#select_product_price");
            var prd_nodes = $('.MS_product_checkbox');
            var _this = this;
            var total_price = 0;
            var total_price_str = null;

            // 선택한 상품 금액 합계
            if (prd_nodes.length > 0) {
                $.each(prd_nodes, function() {
                    if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                        var _price = _product_price = 0;

                        // 옵션할인가 : this.info[idx].optionprice 에 금액 적용
                        _price = _this.info[$(this).val()].optionprice;

                        // 콤마(,)제거
                        _product_price = parseInt(_this.remove_comma(_price));

                        // 금액 누적
                        total_price += _product_price;
                    }
                });
            }

            // 콤마추가
            total_price_str = _this.comma(total_price);

            // 선택상품 총 금액 element있는 경우 추가
            if (_target != undefined) {
                if ($(_target).attr('id') != undefined) {
                    $(_target).text(total_price_str);
                }
            }
        },

        set_stock: function(obj, stock) {
            if (obj === undefined) {return false;}
            if (obj.length == undefined) {
                obj.opt_stock = stock;
            } else {
                $.each(obj, function(_i, _d) {
                    _d.opt_stock = stock;
                });
            }
        },

        // 옵션 데이터 초기화
        unset_data: function(idx) {
            // 가격 계산을 위해 초기값 설정
            var option_nodes = $('[name="optionlist_list' +idx+ '[]"].basic_option_list');
            if (option_nodes.length > 0) {
                this.data.basic[idx] = [];
            }
        },

        // 옵션 데이터 추가
        set_data: function(idx) {
            var _this = this;
            var option_nodes = $('[name="optionlist_list' +idx+ '[]"].basic_option_list');
            var _info = this.info[idx];
            _this.unset_data(idx); // 데이터 초기화 후 데이터 설정 시작

            // 옵션 가상태그 미사용인 경우가 있음
            // 실제 옵션element가 추가되지는 않고, 구매기능시에만 form에 넣는 용도.

            // opt_stock 수량element없으면 해당 상품의 최소주문가능수량을 넣어줌
            if (option_nodes.length > 0) {
                $.each(option_nodes, function(_i) {
                    if ($(this).val().length > 0 && $(this).val() != $(this).attr('title')) {
                        if ($(this).get(0).tagName.toLowerCase() == 'input') {
                            _this.data.basic[idx].push({
                                opt_id      : $(this).attr('opt_id') || '0',
                                opt_type    : $(this).attr('opt_type'),
                                opt_value   : $(this).val(),
                                opt_stock   : ($('#MS_amount_basic_list_' + idx) != undefined && $('#MS_amount_basic_list_' + idx).val() != undefined) ? $('#MS_amount_basic_list_' + idx).val() : _this.info[idx].min_amount,
                                opt_price   : '0',
                                sto_id      : $(this).attr('sto_id') || '0'
                            });
                        } else {
                            _this.data.basic[idx].push({
                                opt_id      : $(this).attr('opt_id') || '0',
                                opt_type    : $(this).attr('opt_type'),
                                opt_value   : $(this).children('option:selected').attr('title'),
                                opt_stock   : ($('#MS_amount_basic_list_' + idx) != undefined && $('#MS_amount_basic_list_' + idx).val() != undefined) ? $('#MS_amount_basic_list_' + idx).val() : _this.info[idx].min_amount,
                                opt_price   : $(this).children('option:selected').attr('price') || '0',
                                sto_id      : $(this).children('option:selected').attr('sto_id') || '0'
                            });
                        }
                    } else {
                        _this.data.basic[idx].push({});
                    }
                });

            } else {
                // product@option 미사용인 경우
                // 구매를 위한 옵션데이터 생성 

                var json_data = _info.optionJsonData.basic;

                // 기본옵션인 경우로 초기값으로 옵션데이터 설정한다
                // 수량은 최수 구매수량
                // 옵션값 : 선택형-선택안함, 작성형/고객형 : 입력안함
                // 옵션가격 : 0

                if (object_count(json_data) > 0) {
                    $.each(json_data, function(_i, _d) {
                        $.each(_d, function(_j, _k) {
                            _this.data.basic[idx].push({
                                opt_id      : _k.opt_id,
                                opt_type    : _k.opt_type,
                                opt_value   : (_k.opt_type == "SELECT") ? "선택안함" : "입력안함",
                                opt_stock   : _info.min_amount,
                                opt_price   : '0',
                                sto_id      : '0'
                            });
                        });
                    });

                } else {
                    _this.data.basic[idx].push({});
                }

            }
            return true;
        },

        set_amount: function(obj, option_mode, mode) {
            var _this   = this;
            var _idx    = (typeof obj === 'string') ? obj.replace('MS_amount_' + option_mode + '_list_', '') : $(obj).attr('id').replace('MS_amount_' + option_mode + '_list_', '');
            var _info   = _this.info[_idx];

            // 옵션 값이 없을경우 처리
            if (_info.option_type != 'NO') {
                if (typeof $(obj).val() == 'undefined' || $(obj).val().replace(/[\s]/g, '').length == 0) {
                    _this.set_data(_idx);
                }
            }
            var _obj    = (typeof obj === 'string') ? $('#' + obj) : $(obj);
            var _mode   = (mode == undefined) ? '' : mode;
            var price   = _info.product_price; // 상품가격

            // 최대,최소 주문수량
            var _maxorder_count = _this.get_max_amount(_idx);
            var _minorder_count = _this.get_min_amount(_idx);

            // 상품 주문수량 체크

            // 0제외 문자체크
            if ($(_obj).val().length == 0 || $(_obj).val() == '' || $(_obj).val() != 0 && isNaN($(_obj).val())) {
                alert(get_lang('quantity_numbers'));
                _this.set_stock(_data, _minorder_count);
                _obj.val(_minorder_count);
                _this.set_product_quantity();
                return false;
            }

            // 최수 1개는 써야한다.
            if ($(_obj).val() < 1) {
                alert(get_lang('min_amount', _minorder_count));
                _this.set_stock(_data, _minorder_count);
                _obj.val(_minorder_count);
                _this.set_product_quantity();
                return false;
            }

            // 이제 수량은 양수
            var _amount = _obj.val().numeric();

            var _data = _this.data[option_mode][_idx];

            // 상품 최소수량 설정시 최소수량씩 증가 (최소수량×갯수만큼 증가/감소) 처리
            if (_this.get_min_add_amount(_idx) != 1 && (_amount % _this.get_min_add_amount(_idx)) != 0) {
                _amount = _this.get_min_add_amount(_idx) * Math.floor(_amount / _this.get_min_add_amount(_idx));
                if (_amount == 0) {
                    _amount = _this.get_min_add_amount(_idx);
                }
            }

            // 정수형으로 값 변경
            switch (_mode) {
                case 'up'   : _amount += _this.get_min_add_amount(_idx); break;
                case 'down' : _amount -= _this.get_min_add_amount(_idx); break;
                default : break;
            }

            // 0은 안받음
            if (_mode == '' && _amount < 1) {
                alert(get_lang('min_amount', _minorder_count));
                _this.set_stock(_data, _minorder_count);
                _obj.val(_minorder_count);
                _this.set_product_quantity();
                return false;
            }

            // 최수주문 갯수 체크
            if (_amount < _minorder_count) {
                alert(get_lang('min_amount', _minorder_count));
                _this.set_stock(_data, _minorder_count);
                _obj.val(_minorder_count);
                _this.set_product_quantity();
                return false;
            }
            
            // 최대주문 갯수 체크
            if (_amount > _maxorder_count) {
                alert(get_lang('max_amount', _maxorder_count));
                _this.set_stock(_this.data[option_mode][_idx], _maxorder_count);

                // 현재 판매가능한 수량을 기준으로 조정
                // 수량무제한(quantity '')
                if (_maxorder_count > _info.quantity && _info.quantity != '') {
                    _obj.val(_info.quantity);
                } else {
                    _obj.val(_maxorder_count);
                }

                _this.set_product_quantity();
                return false;
            }
            // 상품 주문수량 체크 END

            // 재고확인
            // 재고관리가 없으므로, 사실상 상품수량이 재고임
            if (_data !== undefined) {
                var _stock_state = true;
                if (false === _this.check_quantity(_idx, _amount)) {
                    _stock_state = false;
                }
                // 수량을 증가할수 없을 경우엔 여기서 멈춤
                if (_stock_state === false) {
                    // 현재 판매가능수량으로 조정
                    _obj.val(_info.quantity);
                    return false;
                }
            }

            _amount = _amount.toString();
            _this.set_stock(_data, _amount);

            // 개별 상품 수량
            _obj.val(_amount);

            // 무옵션
            if (_info.option_type == 'NO' && ($.inArray(_info.optionJsonData, Array(undefined, null)) === -1 && object_count(_info.optionJsonData.basic) == 1 && (_info.optionJsonData.basic[0][0].opt_value === undefined || _info.optionJsonData.basic[0][0].opt_value == ''))) {
                _this.set_product_price(_idx, price, _amount);

            } else {
                // 옵션가격
                _this.sum_total_price(_idx, _amount);
            }

            // 선택상품 수량입력
            _this.set_product_quantity();

            return;
        },

        // 상품가격 입력
        set_product_price : function(idx, price, amount) {
            var _this = this;
            var total_str = null;

            // 현재는 무옵션상품에 대해서 가격 처리한다.
            // 옵션할인가 : this.info[idx].optionprice 에 금액 적용
            total_str = _this.change_price_str(_this.info[idx].optionprice, price, amount);

            if (total_str.length > 0) {
                _this.info[idx].optionprice = total_str;

                if ($("#optionprice" + idx) != undefined && $("#optionprice" + idx).text().length > 0) {
                    $("#optionprice" + idx).text(total_str);
                }
            }
        },

        // 옵션 총가격 계산
        sum_total_price : function(idx, amount) {
            var _this = this;
            var _data = _this.data.basic[idx];
            var _product_price = _this.info[idx].product_price.numeric(); // 상품가격
            var _basic_price = _basic_single_price = _addition_price = _option_price = 0;
            var _stock = 1;
            var price_value = price_str = null;
            var _info = _this.info[idx];

            // 선택된 옵션에 판매가능수량 적용하여 수량변경
            if (amount != undefined) {
                _stock = amount;
            }

            if (_info.use_option_tag == 'Y') {
                // 기본옵션 총가격 계산
                $.map(_data, function(data, _idx) {
                    if (_data.length == 0) { return true; }
                    var _d_ = _data[_idx];
                    if (_d_.opt_id !== undefined) {
                        if (_d_.opt_type == 'SINGLE') {
                            // 단일부과
                            _basic_single_price += _d_.opt_price.numeric();
                        } else {
                            // 중복부과
                            _basic_price += _d_.opt_price.numeric();
                        }
                    }
                    if (_d_.opt_stock !== undefined && _d_.opt_stock.length > 0) {
                        _stock = _d_.opt_stock.numeric();
                    } else if (_d_['opt_stock'] !== undefined && _d_['opt_stock'].length > 0) {
                        _stock = _d_['opt_stock'].numeric();
                    }
                });

            } else {
                // 옵션 가상태그 미사용
                // 옵션가격이 미포함되므로 최소구매수량으로 처리
                _stock = amount;
            }

            _basic_price *= _stock;
            _basic_price += _basic_single_price;

            // 수량대비 금액계산
            if (_info.option_type == 'NO' && ($.inArray(_info.optionJsonData, Array(undefined, null)) === -1 && object_count(_info.optionJsonData.basic) == 1 && (_info.optionJsonData.basic[0][0].opt_value === undefined || _info.optionJsonData.basic[0][0].opt_value == ''))) {
                _option_price = (_product_price * _stock).numeric();
            } else {
                _option_price = (_product_price * _stock).numeric() + _basic_price.numeric();
            }

            price_str = _this.comma(_option_price);

            // 옵션할인가 : this.info[idx].optionprice 에 금액 적용
            _info.optionprice = price_str;

            // 옵션할인가 가상태그 있으면 노출
            if ($("#optionprice" + idx) != undefined && $("#optionprice" + idx).text().length > 0) {
                price_value = $("#optionprice" + idx);
                $(price_value).text(price_str);
            }
        },

        // 필수입력값 focus
        input_focus: function(obj) {
            if ($(obj).attr('title') == $(obj).val()) {
                $(obj).val('');
            }
            $(obj).blur(function() {
                if ($(obj).val().replace(/[\s]/g, '').length == 0) {
                    $(obj).val($(obj).attr('title'));
                }
            });
            return false;
        },

        // 옵션값 변경 처리
        change_option: function(obj, option_mode, idx) {
            // obj : select, input element
            var _this = this;
            var _info = this.info[idx];

            if (_info.view_member_only_price == 'Y' && typeof _info.IS_LOGIN != 'undefined' && _info.IS_LOGIN === 'false') {
                alert(((shop_language == 'eng') ? 'Member login required to buy.' : '회원 로그인을 하시면 구매하실 수 있습니다.'));
                return;
            }

            // 옵션 수량 체크
            // 수량태그 없으면 최수주문가능수량으로 처리
            if ($('#MS_amount_basic_list_' + idx) != undefined && $('#MS_amount_basic_list_' + idx).val() != undefined) {
                var _stock = $('#MS_amount_basic_list_' + idx).val();
            } else {
                var _stock = _info.min_amount;
            }

            // 필수 옵션 체크
            if (false === _this.check_mandatory(obj)) {
                _this.set_data(idx);
                _this.sum_total_price(idx, _stock);

                // 선택상품 총 금액
                _this.calculate_product_price();

                return false;
            }

            // 옵션 값이 없을경우 처리
            if ($(obj).val().replace(/[\s]/g, '').length == 0) {
                _this.set_data(idx);
                _this.sum_total_price(idx, _stock);

                // 선택상품 총 금액
                _this.calculate_product_price();

                return false;
            }

            if (false === _this.check_quantity(idx, _stock)) {
                _this.set_data(idx);
                _this.sum_total_price(idx, _stock);

                // 선택상품 총 금액
                _this.calculate_product_price();

                return false;
            }

            _this.set_data(idx);
            _this.sum_total_price(idx);

            // 선택상품 총 금액
            _this.calculate_product_price();

            return;
        },

        // 옵션 필수 입력/선택 체크
        check_mandatory: function(obj) {
            var _text = $(obj).get(0).tagName.toLowerCase() == 'input' ? get_lang('enter') : get_lang('select');
            if ($(obj).attr('require') == 'Y' && $(obj).val().replace(/[\s]/g, '').length == 0) {
                alert(get_lang('require_option', '', _text));
                return false;
            }
            return true;
        },

        // 옵션 데이터 체크
        check_data: function(idx) {
            var _this = this;
            var _state = true;

            if (idx.length < 1 || idx == '' || idx == undefined) {
                return false;
            }

            var _info = _this.info[idx];

            // 옵션태그 미사용은 이곳을 떠난다.
            if (_info.use_option_tag == "N") {
                return _state;
            }

            var option_node = $('[name="optionlist_list' + idx + '[]"].basic_option_list');

            // 무옵션은 항상 옳다.
            if (option_node.length < 1) {
                return _state;
            }

            // 필수옵션
            // 기본 옵션 선택 여부 체크
            $.each(option_node, function(_i, _d) {
                // require == Y 기본적으로 data에 값이 세팅되어있으므로 element의 value만 체크하면됨
                if ($(_d).get(0).tagName.toLowerCase() == 'input') {
                    if ($(_d).attr('require') == 'Y') {
                        var _text = '필수 옵션이 ' + get_lang('enter') + '되지 않았습니다.\n옵션을 반드시 입력하세요.';

                        // 자동입력값과 대조하여 없는 경우를 필수입력 누락으로 체크
                        if ($(_d).val().replace(/[\s]/g, '').length < 1 || ($(_d).val().replace(/[\s]/g, '').length > 0 && $(_d).val() == $(_d).attr('title'))) {
                            _state = false;
                        }
                    }
                } else {
                    if ($(_d).attr('require') == 'Y') {
                        var _text = '필수 옵션이 ' + get_lang('select') + '되지 않았습니다.\n옵션을 반드시 선택하세요.';
                        if ($(_d).val().replace(/[\s]/g, '').length < 1) {
                            _state = false;
                        }
                    }
                }

                if (false === _state) {
                    alert(_text);
                    $(_d).focus();
                    return false;
                }
            });

            // 기본 옵션부터 선택되지 않았다면 종료함
            if (false === _state) {
                return _state;
            }
            return true;
        },

        // 옵션태그 미사용 + 필수기본옵션을 포함한 상품 제외
        prevent_mandatory : function(_idx) {
            var _this = this;
            var product_uids = [];
            var product_msg_str = null;
            var product_name_arr = [];

            if (_idx.length < 1 || _idx == '' || _idx == undefined) {
                return false;
            }

            // 선택상품은 다양하게 들어온다.
            if (false === $.isArray(_idx)) {
                product_uids.push(_idx);
            } else {
                product_uids = _idx;
            }

            if (product_uids.length < 1) {
                return false;
            }

            $.each(product_uids, function() {
                var __idx = this;
                var _info = _this.info[__idx];

                // 옵션태그 미등록 : 안봐도 됨
                // 필수 기본옵션X  : 안봐도 됨
                if (_info.use_option_tag == "N" && _info.opt_mandatory_count > 0) {
                    product_name_arr.push("[" + _info.product_name + "]");
                }
            });

            // 상품명 없으면 해당사항 없다.
            if (product_name_arr.length < 1) {
                return true;
            }

            product_msg_str = product_name_arr.join(", ") + " 상품은 상세페이지에서 옵션을 선택 후, 구매/장바구니 담기가 가능합니다.\n상품을 다시 선택해주시기 바랍니다.";

            alert(product_msg_str);

            return false;
        },

        // 장바구니 최대상품갯수
        isAddToCart : function(_idx, basket_tempid, isBaroBuy, isAll) {
            var _this            = this;
            var _target          = $("form[name=product_form]");
            var BasketMaxCount   = ($("#BasketMaxCount", _target).attr('id') == undefined) ? 200 : $("#BasketMaxCount", _target).val();
            var listBuyBuyOpt    = $("#listBuyBuyOpt", _target).val();
            var BasketBasam      = $("#BasketBasam", _target).val();
            var listBuyPvdOrderType = $("#listBuyPvdOrderType", _target).val(); // 공급자 직배송 배송정책
            var MOBILE_USE       = $("input[name=MOBILE_USE]", _target).val();
            var product_uids     = [];
            var now_basket_count = 0;
            var sum_basket_count = 0;
            var _tempid = ''; // 장바구니 tempid
            var _is_all = (isAll != undefined && isAll == 'all') ? 'Y' : 'N';  // 상품선택 여부
            var _state = false;

            // 선택 상품간 비교
            var _bank_only = _card_only = _provider_uid = '';
            var check_basket_bank = check_basket_card = check_basket_provider = 0; // 선택 상품 현금/카드전용결제상품 갯수
            var select_provider_arr = [];   // 선택상품 공급업체
            var both_provider_arr   = [];   // select_provider_arr 중복제거 공급업체
            var basket_single_message = "장바구니에 담긴 상품과 결제방법이 달라서 장바구니에 같이 담을 수 없습니다.\n별도로 주문서를 작성해주시기 바랍니다. 감사합니다.";
            var basket_select_message = baro_buy_message = "결제방법이 다른 상품이 포함되어 있어 장바구니에 같이 담을 수 없습니다.\n별도로 주문서를 작성해주시기 바랍니다. 감사합니다.";
            var provider_single_message = "장바구니에 담긴 상품과 제품 공급업체가 달라서 장바구니에 같이 담을 수 없습니다.\n별도로 주문서를 작성해주시기 바랍니다. 감사합니다.";
            var provider_select_message = baro_provider_message = "제품 공급업체가 다른 상품이 포함되어 있어 장바구니에 같이 담을 수 없습니다.\n별도로 주문서를 작성해주시기 바랍니다. 감사합니다.";

            if (_idx.length < 1 || _idx == '' || _idx == undefined) {
                return false;
            }

            // 선택상품은 다양하게 들어온다.
            if (false === $.isArray(_idx)) {
                product_uids.push(_idx);
            } else {
                product_uids = _idx;
            }

            if (product_uids.length < 1) {
                return false;
            }

            // 직접접근, 캐시삭제접근 tempid값은 없을수있음
            // 하지만 한번이라도 이동하면 tempid생기므로 ajax처리시 생성되므로 무관 세팅됨
            if (basket_tempid != undefined && basket_tempid.length > 1 && basket_tempid != '') {
                _tempid = basket_tempid; 
            }

            $.each(product_uids, function(_i, _d) {
                _bank_only = _this.info[_d].bank_payment_only;
                _card_only = _this.info[_d].card_payment_only;
                _provider_uid = (_this.info[_d].provider_uid == '' || _this.info[_d].provider_uid.length < 1 || _this.info[_d].provider_uid == null) ? 0 : _this.info[_d].provider_uid;
                select_provider_arr.push(_provider_uid);

                if (_bank_only == 'Y') {	// 현금전용결제상품 여부
                    check_basket_bank++;
                } else if (_card_only == 'Y') {	// 카드전용결제상품 여부
                    check_basket_card++;
                }
            });

            // 선택 상품 결제전용상품 비교
            // 바로구매 장바구니상품 포함인 경우 해당
            if (listBuyBuyOpt != 'Y') {
                if (check_basket_bank > 0 && check_basket_card > 0) {
                    if (isBaroBuy == 'baro') {
                        alert(baro_buy_message);
                    } else {
                        if (_is_all == 'Y') {
                            alert(basket_select_message);
                        } else {
                            alert(basket_single_message);
                        }
                    }
                    return false;
                }

                // 선택 상품 공급업체 비교
                // 통합장바구니1,2를 이용시에는 공급자별 체크를 하지 않는다.
                if (listBuyPvdOrderType != 'HEADER' && listBuyPvdOrderType != 'EACH') {
                    if (select_provider_arr.length > 0) {
                        $.each(select_provider_arr, function(_i, _d) {
                            if ($.inArray(_d, both_provider_arr) === -1) {
                               both_provider_arr.push(_d); 
                            }
                        });
                    }

                    // 공급업체가 적어도 1개 이상이라는 말은 안된다는거다.
                    if (both_provider_arr.length > 1) {
                        if (isBaroBuy == 'baro') {
                            alert(baro_provider_message);
                        } else {
                            if (_is_all == 'Y') {
                                alert(provider_select_message);
                            } else {
                                alert(provider_single_message);
                            }
                        }
                        return false;
                    }
                }
            }
            // 선택 상품간 비교 END

            // basket으로 넘어가면 모든 소스 다 훑고 내려가기때문에 미리체크를 한다.
            // 실시간 장바구니 갯수체크하려면 불가피함

            // 디바이스 환경에 따른 url
            var _shopdetail_ajax_url = (MOBILE_USE != 'YES') ? './shopdetail.ajax.html' : './product.action.html';

            $.ajax({
                url: _shopdetail_ajax_url,
                type: 'POST',
                dataType: 'json',
                async : false, // [필수]
                data: { action_mode : 'list_buy_basket_count', basket_tempid : _tempid, pvd_order_type : listBuyPvdOrderType, baro_opt : listBuyBuyOpt },
                success: function(res) {
                    // 현재 cart에 있는 상품수
                    now_basket_count = res.data;

                    // product_form에 실시간 장바구니 상품갯수 넣어줌
                    $("#nowBasketCount", _target).val(now_basket_count);

                    // 바로구매시 장바구니 상품포함 설정 + 현재 cart 상품 1개 이상인 경우 선얼럿
                    if (isBaroBuy == 'baro') {
                        if (listBuyBuyOpt == 'N') {
                            if (parseInt(now_basket_count) > 0) {
                                alert("장바구니에 담겨 있는, 상품도 함께 주문됩니다.\n원치 않으실 경우 장바구니를 비워주세요.");
                            }
                        }
                    }

                    // 바로구매 장바구니상품 제외는 해당없음.
                    if (listBuyBuyOpt != 'Y') {
                        var basket_bank_pay_status = res.basket_bank_pay_status;    // 장바구니 보관상품 현금전용결제상품 보관 유무
                        var basket_card_pay_status = res.basket_card_pay_status;    // 장바구니 보관상품 카드전용결제상품 보관 유무

                        // 통합장바구니1,2를 이용시에는 공급자별 체크를 하지 않는다.
                        if (listBuyPvdOrderType != 'HEADER' && listBuyPvdOrderType != 'EACH') {
                            var basket_provider_status = res.basket_provider_status;    // 장바구니 보관상품 공급업체

                            // 장바구니 상품 공급업체 체크
                            if (basket_provider_status != undefined) {
                                if (basket_provider_status.length == 1) {
                                    if (both_provider_arr.length > 0) {
                                        $.each(both_provider_arr, function(_i, _d) {
                                            if (_d != basket_provider_status[0]) { 
                                                check_basket_provider++;
                                            }
                                        });

                                        if (check_basket_provider > 0) {
                                            if (isBaroBuy == 'baro') {
                                                alert(baro_provider_message);
                                            } else {
                                                if (_is_all == 'Y') {
                                                    alert(provider_select_message);
                                                } else {
                                                    alert(provider_single_message);
                                                }
                                            }
                                            return false;
                                        }
                                    }
                                }
                            }
                        }

                        // 장바구니 상품과 결제방법과 비교
                        if ((basket_card_pay_status == 'Y' && check_basket_bank > 0) || (basket_bank_pay_status == 'Y' && check_basket_card > 0)) {
                            if (isBaroBuy == 'baro') {
                                alert(baro_buy_message);
                            } else {
                                if (_is_all == 'Y') {
                                    alert(basket_select_message);
                                } else {
                                    alert(basket_single_message);
                                }
                            }
                            return false;
                        }
                    }
                    // 장바구니 상품과 결제방법과 비교 END

                    // 동일옵션상품 담을경우 수량증가인 경우에는 장바구니 최대 상품갯수 체크하지않고 basket에서 확인하도록 한다.
                    if (BasketBasam == 'N') {
                        // 현재 장바구니 담긴갯수 + 상품 개별/선택 갯수 합산
                        sum_basket_count = parseInt(now_basket_count) + parseInt(product_uids.length);

                        // 장바구니 최대 상품갯수 확인
                        if (sum_basket_count > BasketMaxCount) {
                            alert("장바구니에는 총" +BasketMaxCount+ "개 까지만 담을 수 있습니다.");
                            return false;
                        }
                    }

                    _state = true;

                    return true;
                }
            });

            // 2차 확인
            if (false === _state) {
                return false;
            }

            return true;
        },

        // 단일상품 옵션담기
        print_option: function(form_name, mode, _idx, isBaroBuy) {
            var _this = this;
            var _info = _this.info[_idx];
            var _json = _info.optionJsonData;
            var _options = [];
            var _target = (typeof form_name == 'object') ? $(form_name) : $('#' + form_name);
            var is_wish_opt = $("input[name=is_wish_opt]", $(_target)).val();
            var _no = 0;
            var _option_name = 'option_list[basic][0]';
            var listBuyTempid = $("#listBuyTempid", _target).val();

            // 필수 옵션들을 선택했는지 체크
            // 위시리스트일땐 체크 안함
            if (mode != 'wish') {
                if (false == _this.check_data(_idx)) {
                    return false;
                }

                // 옵션 가상태그 미사용 필수옵션 체크
                if (false == this.prevent_mandatory(_idx)) {
                    return false;
                }

                // 장바구니 최대 상품갯수 확인
                if (false == _this.isAddToCart(_idx, listBuyTempid, isBaroBuy)) {
                    return false;
                }
            }

            // 비우고 시작
            $('.MS_option_values', $(_target)).remove();

            // 상품기본값 셋팅
            _options.push('<input type="hidden" class="MS_option_values" name="brandcode"  value="' + _info.brandcode   + '" />');
            _options.push('<input type="hidden" class="MS_option_values" name="branduid"   value="' + _info.product_uid + '" />');
            _options.push('<input type="hidden" class="MS_option_values" name="adult_only" value="' + _info.adult_only  + '" />');

            // 수량태그 없으면 최소수량 들어감
            if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + $("#MS_amount_basic_list_" + _idx).val() + '" />');
            } else {
                _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + _info.min_amount + '" />');
            }
            // 기본적으로 _options.length는 4로 시작

            // 위시리스트에 상품 옵션 포함/상품정보만 담기
            if (is_wish_opt == undefined || is_wish_opt == 'N') {
                // 상품정보만 담음
                $(_target).append(_options.join('\n'));
                return true;
            }

            // 장바구니 및 wishlist 전달위한 옵션element 생성
            // 무옵션
            if (_info.option_type == 'NO' && ($.inArray(_json, Array(undefined, null)) === -1 && object_count(_json.basic) == 1 && (_json.basic[0][0].opt_value === undefined || _json.basic[0][0].opt_value == ''))) {
                var _data = _this.data.basic[_idx][0];
                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_id]"    value="' + _data.opt_id +    '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_value]" value="' + _data.opt_value + '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_stock]" value="' + _data.opt_stock + '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][sto_id]"    value="' + _data.sto_id +    '" />');

            } else {
                // 기본옵션

                // 옵션가상태그 미사용
                if (_info.use_option_tag == 'N') {

                    // 옵션가상태그 사용하지 않는경우는 옵션element가 없다.
                    // 바로구매, 장바구니시에는 옵션이 필요함.
                    // 초기값을 강제로 넣어준다.
                    if (_this.data.basic[_idx].length < 1) {
                        _this.set_data(_idx);
                    }

                    // 추가된 옵션이 있는 경우에 제거
                    $('.MS_option_values', $(_target)).remove();

                    var _data = _this.data.basic[_idx];

                    $.each(_data, function(_i, _d) {
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + _d.opt_id    + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + _d.opt_value + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _d.opt_stock + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="' + _d.sto_id    + '" />');

                        _no++;
                    });

                } else {
                    // 옵션값 존재에 따른 element 체크
                    // 개별옵션은 기본상품만 cart에 담기 위한 옵션이 필요함
                    var check_opt = $('[name="optionlist_list' +_idx+ '[]"].basic_option_list').eq(0).attr('name');

                    // 개별옵션
                    if (check_opt == undefined) {
                        var _data = _this.data.basic[_idx][0];
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_id]"    value="' + _data.opt_id +    '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_value]" value="' + _data.opt_value + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_stock]" value="' + _data.opt_stock + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][sto_id]"    value="' + _data.sto_id +    '" />');

                    } else {
                        var _data = _this.data.basic[_idx];

                        $.each(_data, function(_i, _d) {
                            // 옵션선택하지 않는 경우에는 element값으로 셋팅
                            if (_d == undefined || _d.opt_id == undefined) {
                                var _opt = $('[name="optionlist_list' +_idx+ '[]"].basic_option_list').eq(_i);

                                if ($(_opt).get(0).tagName.toLowerCase() == 'input') {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + $(_opt).attr('opt_id') + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('no_input_txt') + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="0" />');
                                } else {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + $(_opt).attr('opt_id') + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('non_option_txt') + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="0" />');
                                }

                                // 수량태그 없으면 최소수량 들어감
                                if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + $('#MS_amount_basic_list_' + _idx).val() + '" />');
                                } else {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _info.min_amount + '" />');
                                }
                            } else {
                                // 선택한 옵션을 셋팅
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + _d.opt_id    + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + _d.opt_value + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _d.opt_stock + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="' + _d.sto_id    + '" />');
                            }

                            _no++;
                        });
                    }

                    // 추가된 옵션이 있는 경우에 제거
                    $('.MS_option_values', $(_target)).remove();

                    // 상품기본정보만 있으면 4이다.
                    // 옵션을 선택하지 않은 상태에서 직접 element값으로 셋팅
                    if (_options.length == 4) {
                        $.each($('[name="optionlist_list' +_idx+ '[]"].basic_option_list'), function(_i, _d) {
                            if ($(this).get(0).tagName.toLowerCase() == 'input') {
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + $(this).attr('opt_id') + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('no_input_txt') + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="0" />');
                            } else {
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + $(this).attr('opt_id') + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('non_option_txt') + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="0" />');
                            }

                            // 수량태그 없으면 최소수량 들어감
                            if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + $('#MS_amount_basic_list_' + _idx).val() + '" />');
                            } else {
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _info.min_amount + '" />');
                            }

                            _no++;
                        });
                    }
                }
            }

            // 생성된 옵션 input 값들을 append함
            $(_target).append(_options.join('\n'));
        },

        // 선택상품 옵션담기
        print_option_select : function(form_name, mode, isBaroBuy) {
            var _this = this;
            var product_idx = [];
            var total_options = [];

            var ok_basket_state = true;
            var basket_must_option_state = 0;

            var _target = (typeof form_name == 'object') ? $(form_name) : $('#' + form_name);
            var is_wish_opt = $("input[name=is_wish_opt]", $(_target)).val();
            var prd_nodes = $('.MS_product_checkbox');
            var listBuyTempid = $("#listBuyTempid", _target).val();

            // 체크선택 확인
            if (prd_nodes == undefined || prd_nodes.length < 1) {
                alert('선택된 상품이 없습니다. 상품을 선택해주세요.');
                return false;
            }

            $.each(prd_nodes, function() {
                if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                    product_idx.push($(this).val());
                }
            });

            if (product_idx.length < 1) {
                alert('선택된 상품이 없습니다. 상품을 선택해주세요.');
                return false;
            }

            var basic_option_length = parseInt(product_idx.length * 4);

            // 비우고 시작
            $('.MS_option_values', $(_target)).remove();

            // 체크한 상품 중 필수 옵션들을 선택했는지 체크
            // 위시리스트일땐 체크 안함
            if (mode != 'wish') {
                $.each(product_idx, function(_i, prd_idx) {
                    if (false === _this.check_data(prd_idx)) {
                        ok_basket_state = false;
                        return false;
                    }
                });

                // 시간차로 한번더 확인
                if (false === ok_basket_state) {
                    return false;
                }

                // 옵션 가상태그 미사용 필수옵션 체크
                if (false == _this.prevent_mandatory(product_idx)) {
                    return false;
                }

                // 장바구니 최대 상품갯수 확인
                if (false == _this.isAddToCart(product_idx, listBuyTempid, isBaroBuy, 'all')) {
                    return false;
                }

            } else {
                // mode=wish
                // 위시리스트에 상품 옵션 포함/상품정보만 담기
                if (is_wish_opt == undefined || is_wish_opt == '' || is_wish_opt == 'N') {
                    // 상품기본값만 세팅
                    $.each(product_idx, function(_i, idx) {
                        _options.push('<input type="hidden" class="MS_option_values" name="brandcode[]"  value="' + _this.info[idx].brandcode   + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="branduid[]"   value="' + _this.info[idx].product_uid + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="adult_only[]" value="' + _this.info[idx].adult_only  + '" />');

                        // 수량태그 없으면 최소수량 들어감
                        if ($("#MS_amount_basic_list_" + idx) != undefined && $("#MS_amount_basic_list_" + idx).val() != undefined) {
                            _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + $("#MS_amount_basic_list_" + idx).val() + '" />');
                        } else {
                            _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + _this.info[idx].min_amount + '" />');
                        }
                    });

                    $(_target).append(_options.join('\n'));
                    return true;
                }
                // wishlist 선택상품만 담기 END
            }

            // 선택된 상품idx에 해당하는 옵션생성
            $.each(product_idx, function(_i, _idx) {
                var _info = _this.info[_idx];
                var _option_name = 'option_list[basic][' +_i+ ']';
                var _json = _info.optionJsonData;
                var _no = 0;
                var _options = [];

                // 상품기본값 셋팅
                _options.push('<input type="hidden" class="MS_option_values" name="brandcode[]"  value="' + _info.brandcode   + '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="branduid[]"   value="' + _info.product_uid + '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="adult_only[]" value="' + _info.adult_only  + '" />');

                // 수량태그 없으면 최소주문수량으로 들어감
                if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                    _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + $("#MS_amount_basic_list_" + _idx).val() + '" />');
                } else {
                    _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + _info.min_amount + '" />');
                }
                // 선택상품당 4개씩 쌓인다.

                // 무옵션
                if (_info.option_type == 'NO' && ($.inArray(_json, Array(undefined, null)) === -1 && object_count(_json.basic) == 1 && (_json.basic[0][0].opt_value === undefined || _json.basic[0][0].opt_value == ''))) {
                    var _data = _this.data.basic[_idx][0];

                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_id]"    value="' + _data.opt_id +    '" />');
                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_value]" value="' + _data.opt_value + '" />');
                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_stock]" value="' + _data.opt_stock + '" />');
                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][sto_id]"    value="' + _data.sto_id +    '" />');
                } else {

                    // 옵션가상태그 미사용
                    if (_info.use_option_tag == 'N') {

                        // 옵션가상태그 사용하지 않는경우는 옵션element가 없다.
                        // 바로구매, 장바구니시에는 옵션이 필요함.
                        // 초기값을 강제로 넣어준다.
                        if (_this.data.basic[_idx].length < 1) {
                            _this.set_data(_idx);
                        }

                        // 추가된 옵션이 있는 경우에 제거
                        $('.MS_option_values', $(_target)).remove();

                        var _data = _this.data.basic[_idx];

                        $.each(_data, function(_i, _d) {
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + _d.opt_id    + '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + _d.opt_value + '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _d.opt_stock + '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="' + _d.sto_id    + '" />');

                            _no++;
                        });

                    } else {
                        // 옵션값 존재에 따른 element 체크
                        // 개별옵션은 기본상품만 cart에 담기 위한 옵션이 필요함
                        var check_opt = $('[name="optionlist_list' +_idx+ '[]"].basic_option_list').eq(0).attr('name');

                        if (check_opt == undefined) {
                            var _data = _this.data.basic[_idx][0];
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_id]"    value="' + _data.opt_id +    '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_value]" value="' + _data.opt_value + '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_stock]" value="' + _data.opt_stock + '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][sto_id]"    value="' + _data.sto_id +    '" />');

                        } else {
                            // 기본옵션
                            var _data = _this.data.basic[_idx];

                            $.each(_data, function(_i, _d) {
                                // 옵션선택하지 않는 경우에는 element값으로 셋팅
                                if (_d == undefined || _d.opt_id == undefined) {
                                    var _opt = $('[name="optionlist_list' +_idx+ '[]"].basic_option_list').eq(_i);

                                    if ($(_opt).get(0).tagName.toLowerCase() == 'input') {
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + $(_opt).attr('opt_id') + '" />');
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('no_input_txt') + '" />');
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="0" />');
                                    } else {
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + $(_opt).attr('opt_id') + '" />');
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('non_option_txt') + '" />');
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="0" />');
                                    }

                                    // 수량태그 없으면 최소수량 들어감
                                    if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + $('#MS_amount_basic_list_' + _idx).val() + '" />');
                                    } else {
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _info.min_amount + '" />');
                                    }
                                } else {
                                    // 선택한 옵션을 셋팅
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + _d.opt_id    + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + _d.opt_value + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _d.opt_stock + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="' + _d.sto_id    + '" />');
                                }

                                _no++;
                            });
                        }

                        // 추가된 옵션이 있는 경우에 제거
                        $('.MS_option_values', $(_target)).remove();

                        // 상품기본정보만 있으면 4개
                        // 옵션을 선택하지 않은 상태에서 직접 element값으로 셋팅
                        if (_options.length == 4) {
                            $.each($('[name="optionlist_list' +_idx+ '[]"].basic_option_list'), function(_i, _d) {
                                if ($(this).get(0).tagName.toLowerCase() == 'input') {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + $(this).attr('opt_id') + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('no_input_txt') + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="0" />');
                                } else {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + $(this).attr('opt_id') + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('non_option_txt') + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="0" />');
                                }

                                // 수량태그 없으면 최소수량 들어감
                                if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + $('#MS_amount_basic_list_' + _idx).val() + '" />');
                                } else {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _info.min_amount + '" />');
                                }

                                _no++;
                            });
                        }
                    }

                }
                total_options.push(_options.join('\n'));
            });

            // 선택한 상품 갯수
            $("#listBuySelectCount", _target).val('Y');

            // 생성된 옵션 input 값들을 append함
            $(_target).append(total_options.join('\n'));
        },

        // 판매가능상품 수량 체크
        check_quantity: function(_idx, amount) {
            // 통옵기준
            // 분류구매에 해당하는 상품은 판매가능수량이 재고이므로, 재고관리를 따로하지않음
            // 현재 수량과 구매수량 비교해서 직접비교하면 됨

            var _this                   = this;
            var product_uids            = [];
            var product_name_arr        = [];
            var product_quantity_arr    = [];
            var product_msg_str         = null;
            var product_msg_last_str    = "\n감사합니다.";
            var _state                  = false;
            var listBasketStock         = $("#product_form input[name=listBasketStock]").val();

            if (_idx.length < 1 || _idx == '' || _idx == undefined) {
                return _state;
            }

            // set_amount만큼 모든곳에서 사용한다.
            // 선택상품은 다양하게 들어온다.
            if (false === $.isArray(_idx)) {
                product_uids.push(_idx);
            } else {
                product_uids = _idx;
            }

            if (product_uids.length < 1) {
                return _state;
            }

            $.each(product_uids, function() {
                var __idx = this;
                var _info = _this.info[__idx];

                // 현재 판매가능한 상품수량
                // amount값과 비교하여 초과된 상품에 대해서 모아처리
                var now_quantity = parseInt(_info.quantity);

                if (amount > now_quantity) {
                    product_name_arr.push(_info.product_name);
                    product_quantity_arr.push(_info.quantity);
                }
            });

            // 판매가능한 수량이 없는 상품만 계속 진행
            if (product_name_arr.length < 1) {
                _state = true;
                return _state;
            }

            $.each(product_name_arr, function(_i, _product_name) {
                if (listBasketStock == 'Y') {
                    product_msg_str = "[" +_product_name+ "] 상품의 재고가 현재 " +product_quantity_arr[_i]+ "개 입니다.\n수량/상품 체크를 다시 하시기 바랍니다.";
                } else {
                    product_msg_str = "[" +_product_name+ "] 상품의 재고가 부족합니다.\n수량/상품 체크를 다시 하시기 바랍니다.";
                }
            });

            alert(product_msg_str + product_msg_last_str);

            return _state;
        },

        // 상품 회원전용 여부 확인(성인,회원전용)
        check_product_auth : function(idx, type) {
            var _this           = this;
            var info_cnt        = 0;
            var adult_only_cnt  = 0;    // 성인전용결제상품 갯수
            var _adult_state    = false;
            var _return_state   = false;

            if (idx == undefined || idx == '') {
                return _return_state;
            }

            // 개별상품인 경우
            if (idx != 'ALL') {
                var _info = _this.info[idx];

                // 성인전용결제
                if (type == 'adult') {
                    if (_info.adult_only == 'Y') {
                        _return_state = true;
                    }
                }

                return _return_state;
                // 개별상품 END

            } else {
                // check product
                if (_this.info == undefined) {
                    return _return_state;
                }

                info_cnt = _this.info.length;

                if (info_cnt < 1) {
                    return _return_state;
                }

                // 선택상품 노드
                var prd_nodes = $('.MS_product_checkbox');

                // 선택상품 없으면 패스
                if (prd_nodes == undefined || $(prd_nodes).eq(0).val() == undefined) {
                    return _return_state;
                }

                // 체크된 상품 중 전용상품 확인
                if (prd_nodes.length > 0) {
                    $.each(prd_nodes, function(_i) {
                        if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                            // 성인전용결제 상품 체크
                            if (type == 'adult') {
                                if (_this.info[_i] != undefined && _this.info[_i].adult_only == 'Y') {
                                    adult_only_cnt++;
                                }
                            }
                        }
                    });
                }

                // 성인전용결제상품 포함인 경우에 인증절차 허용
                if (adult_only_cnt > 0) {
                    _return_state = true;
                }

                return _return_state;
            }
        }
    };
})(jQuery);

// change amount
function set_amount_list(obj, option_mode, mode) {
    option_manager_list.set_amount(obj, option_mode, mode);
}
// option focus
function option_focus_list(obj) {
    option_manager_list.input_focus(obj);
    return false;
}
// change option
function change_option_list(obj, option_mode, idx) {
    option_manager_list.change_option(obj, option_mode, idx);
    return false;
}
// check product
function check_product_list() {
    option_manager_list.check_product();
}
// create option element
function create_option_input_list(form_name, mode, idx, isBaroBuy) {
    if (idx == 'ALL') {
        if (false === option_manager_list.print_option_select(form_name, mode, isBaroBuy)) {
            return false;
        }
    } else {
        if (false === option_manager_list.print_option(form_name, mode, idx, isBaroBuy)) {
            return false;
        }
    }
}
// check adult auth
function check_product_auth(idx, type) {
    return option_manager_list.check_product_auth(idx, type);
}
// now basket count
function basket_count_list(basket_tempid) {
    option_manager_list.basket_count(basket_tempid);
}
