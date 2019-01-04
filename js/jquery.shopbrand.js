/*
 * shopbrand �з����� ���� ��ũ��Ʈ
 * ���� : ���տɼ� ���ɼ�, �⺻�ɼǸ� ����
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
                // ����Ͽ��� @checkbox ��Ȱ��ȭ -> ����element�� �����Ƿ� ����������ư�� Ŭ���� �����.
                // @checkbox, @amount, @link_amount_up, @link_amount_down ������ ������ �̳���
                var MS_product_checkbox_node = $(".MS_product_checkbox").eq(_idx); // üũ�ڽ�
                var _amount_ctrl_tags        = $(".MK_qty-ctrl a", $("#MS_product ul dl").eq(_idx)); // ����
                var is_MS_product_checkbox_node = true; // üũ�ڽ�����
                var is_amount_ctrl_tag          = true; // ����������ũ ����
                var is_amount_tag               = true; // ��������
                var amount_ctrl_tag_cnt         = 0;    // �������� ��ũ�±�(2�� ��)

                // @checkbox
                // ��Ȱ��ȭ �� �±� ������ ���� �̳���
                if ($(MS_product_checkbox_node).attr('class') == undefined || $(MS_product_checkbox_node).attr('disabled') == 'disabled' || true == $(MS_product_checkbox_node).attr('disabled')) {
                    is_MS_product_checkbox_node = false;
                }

                if ($(".MK_qty-ctrl", $("#MS_product ul dl").eq(_idx)) != undefined) {
                    // @amount_link
                    // ����������ũ���� 2�� ��� ������ ���� �̳���
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
                // �����±� ������ �̳���
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

        // ��ǰ����Ʈ ���û�ǰ �� ����
        set_product_quantity : function() {
            var _target   = $("#select_product_quantity");
            var prd_nodes = $('.MS_product_checkbox');
            var prd_quantity = 0;
            var _this = this;

            // ������ ��ǰ�� ������ �հ�
            if (prd_nodes.length > 0) {
                $.each(prd_nodes, function() {
                    if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                        var amount_obj = $("#MS_amount_basic_list_" + $(this).val());

                        // �����±׾����� �ּ��ֹ�������
                        if ($(amount_obj).val() == undefined || $(amount_obj).val() == '' || $(amount_obj).val().length < 1) {
                            prd_quantity = prd_quantity + parseInt( _this.info[$(this).val()].min_amount );
                        } else {
                            prd_quantity = prd_quantity + parseInt($(amount_obj).val());
                        }
                    }
                });
            }

            // ���û�ǰ �� ���� element�ִ� ��� �߰�
            if (_target != undefined) {
                if ($(_target).attr('id') != undefined) {
                    $(_target).text(prd_quantity);
                }
            }

            // ���û�ǰ �� �ݾ�
            _this.calculate_product_price();
        },

        // ��ǰ����Ʈ ���û�ǰ �� �ݾ�
        calculate_product_price : function() {
            var _target   = $("#select_product_price");
            var prd_nodes = $('.MS_product_checkbox');
            var _this = this;
            var total_price = 0;
            var total_price_str = null;

            // ������ ��ǰ �ݾ� �հ�
            if (prd_nodes.length > 0) {
                $.each(prd_nodes, function() {
                    if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                        var _price = _product_price = 0;

                        // �ɼ����ΰ� : this.info[idx].optionprice �� �ݾ� ����
                        _price = _this.info[$(this).val()].optionprice;

                        // �޸�(,)����
                        _product_price = parseInt(_this.remove_comma(_price));

                        // �ݾ� ����
                        total_price += _product_price;
                    }
                });
            }

            // �޸��߰�
            total_price_str = _this.comma(total_price);

            // ���û�ǰ �� �ݾ� element�ִ� ��� �߰�
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

        // �ɼ� ������ �ʱ�ȭ
        unset_data: function(idx) {
            // ���� ����� ���� �ʱⰪ ����
            var option_nodes = $('[name="optionlist_list' +idx+ '[]"].basic_option_list');
            if (option_nodes.length > 0) {
                this.data.basic[idx] = [];
            }
        },

        // �ɼ� ������ �߰�
        set_data: function(idx) {
            var _this = this;
            var option_nodes = $('[name="optionlist_list' +idx+ '[]"].basic_option_list');
            var _info = this.info[idx];
            _this.unset_data(idx); // ������ �ʱ�ȭ �� ������ ���� ����

            // �ɼ� �����±� �̻���� ��찡 ����
            // ���� �ɼ�element�� �߰������� �ʰ�, ���ű�ɽÿ��� form�� �ִ� �뵵.

            // opt_stock ����element������ �ش� ��ǰ�� �ּ��ֹ����ɼ����� �־���
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
                // product@option �̻���� ���
                // ���Ÿ� ���� �ɼǵ����� ���� 

                var json_data = _info.optionJsonData.basic;

                // �⺻�ɼ��� ���� �ʱⰪ���� �ɼǵ����� �����Ѵ�
                // ������ �ּ� ���ż���
                // �ɼǰ� : ������-���þ���, �ۼ���/������ : �Է¾���
                // �ɼǰ��� : 0

                if (object_count(json_data) > 0) {
                    $.each(json_data, function(_i, _d) {
                        $.each(_d, function(_j, _k) {
                            _this.data.basic[idx].push({
                                opt_id      : _k.opt_id,
                                opt_type    : _k.opt_type,
                                opt_value   : (_k.opt_type == "SELECT") ? "���þ���" : "�Է¾���",
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

            // �ɼ� ���� ������� ó��
            if (_info.option_type != 'NO') {
                if (typeof $(obj).val() == 'undefined' || $(obj).val().replace(/[\s]/g, '').length == 0) {
                    _this.set_data(_idx);
                }
            }
            var _obj    = (typeof obj === 'string') ? $('#' + obj) : $(obj);
            var _mode   = (mode == undefined) ? '' : mode;
            var price   = _info.product_price; // ��ǰ����

            // �ִ�,�ּ� �ֹ�����
            var _maxorder_count = _this.get_max_amount(_idx);
            var _minorder_count = _this.get_min_amount(_idx);

            // ��ǰ �ֹ����� üũ

            // 0���� ����üũ
            if ($(_obj).val().length == 0 || $(_obj).val() == '' || $(_obj).val() != 0 && isNaN($(_obj).val())) {
                alert(get_lang('quantity_numbers'));
                _this.set_stock(_data, _minorder_count);
                _obj.val(_minorder_count);
                _this.set_product_quantity();
                return false;
            }

            // �ּ� 1���� ����Ѵ�.
            if ($(_obj).val() < 1) {
                alert(get_lang('min_amount', _minorder_count));
                _this.set_stock(_data, _minorder_count);
                _obj.val(_minorder_count);
                _this.set_product_quantity();
                return false;
            }

            // ���� ������ ���
            var _amount = _obj.val().numeric();

            var _data = _this.data[option_mode][_idx];

            // ��ǰ �ּҼ��� ������ �ּҼ����� ���� (�ּҼ�����������ŭ ����/����) ó��
            if (_this.get_min_add_amount(_idx) != 1 && (_amount % _this.get_min_add_amount(_idx)) != 0) {
                _amount = _this.get_min_add_amount(_idx) * Math.floor(_amount / _this.get_min_add_amount(_idx));
                if (_amount == 0) {
                    _amount = _this.get_min_add_amount(_idx);
                }
            }

            // ���������� �� ����
            switch (_mode) {
                case 'up'   : _amount += _this.get_min_add_amount(_idx); break;
                case 'down' : _amount -= _this.get_min_add_amount(_idx); break;
                default : break;
            }

            // 0�� �ȹ���
            if (_mode == '' && _amount < 1) {
                alert(get_lang('min_amount', _minorder_count));
                _this.set_stock(_data, _minorder_count);
                _obj.val(_minorder_count);
                _this.set_product_quantity();
                return false;
            }

            // �ּ��ֹ� ���� üũ
            if (_amount < _minorder_count) {
                alert(get_lang('min_amount', _minorder_count));
                _this.set_stock(_data, _minorder_count);
                _obj.val(_minorder_count);
                _this.set_product_quantity();
                return false;
            }
            
            // �ִ��ֹ� ���� üũ
            if (_amount > _maxorder_count) {
                alert(get_lang('max_amount', _maxorder_count));
                _this.set_stock(_this.data[option_mode][_idx], _maxorder_count);

                // ���� �ǸŰ����� ������ �������� ����
                // ����������(quantity '')
                if (_maxorder_count > _info.quantity && _info.quantity != '') {
                    _obj.val(_info.quantity);
                } else {
                    _obj.val(_maxorder_count);
                }

                _this.set_product_quantity();
                return false;
            }
            // ��ǰ �ֹ����� üũ END

            // ���Ȯ��
            // ��������� �����Ƿ�, ��ǻ� ��ǰ������ �����
            if (_data !== undefined) {
                var _stock_state = true;
                if (false === _this.check_quantity(_idx, _amount)) {
                    _stock_state = false;
                }
                // ������ �����Ҽ� ���� ��쿣 ���⼭ ����
                if (_stock_state === false) {
                    // ���� �ǸŰ��ɼ������� ����
                    _obj.val(_info.quantity);
                    return false;
                }
            }

            _amount = _amount.toString();
            _this.set_stock(_data, _amount);

            // ���� ��ǰ ����
            _obj.val(_amount);

            // ���ɼ�
            if (_info.option_type == 'NO' && ($.inArray(_info.optionJsonData, Array(undefined, null)) === -1 && object_count(_info.optionJsonData.basic) == 1 && (_info.optionJsonData.basic[0][0].opt_value === undefined || _info.optionJsonData.basic[0][0].opt_value == ''))) {
                _this.set_product_price(_idx, price, _amount);

            } else {
                // �ɼǰ���
                _this.sum_total_price(_idx, _amount);
            }

            // ���û�ǰ �����Է�
            _this.set_product_quantity();

            return;
        },

        // ��ǰ���� �Է�
        set_product_price : function(idx, price, amount) {
            var _this = this;
            var total_str = null;

            // ����� ���ɼǻ�ǰ�� ���ؼ� ���� ó���Ѵ�.
            // �ɼ����ΰ� : this.info[idx].optionprice �� �ݾ� ����
            total_str = _this.change_price_str(_this.info[idx].optionprice, price, amount);

            if (total_str.length > 0) {
                _this.info[idx].optionprice = total_str;

                if ($("#optionprice" + idx) != undefined && $("#optionprice" + idx).text().length > 0) {
                    $("#optionprice" + idx).text(total_str);
                }
            }
        },

        // �ɼ� �Ѱ��� ���
        sum_total_price : function(idx, amount) {
            var _this = this;
            var _data = _this.data.basic[idx];
            var _product_price = _this.info[idx].product_price.numeric(); // ��ǰ����
            var _basic_price = _basic_single_price = _addition_price = _option_price = 0;
            var _stock = 1;
            var price_value = price_str = null;
            var _info = _this.info[idx];

            // ���õ� �ɼǿ� �ǸŰ��ɼ��� �����Ͽ� ��������
            if (amount != undefined) {
                _stock = amount;
            }

            if (_info.use_option_tag == 'Y') {
                // �⺻�ɼ� �Ѱ��� ���
                $.map(_data, function(data, _idx) {
                    if (_data.length == 0) { return true; }
                    var _d_ = _data[_idx];
                    if (_d_.opt_id !== undefined) {
                        if (_d_.opt_type == 'SINGLE') {
                            // ���Ϻΰ�
                            _basic_single_price += _d_.opt_price.numeric();
                        } else {
                            // �ߺ��ΰ�
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
                // �ɼ� �����±� �̻��
                // �ɼǰ����� �����ԵǹǷ� �ּұ��ż������� ó��
                _stock = amount;
            }

            _basic_price *= _stock;
            _basic_price += _basic_single_price;

            // ������� �ݾװ��
            if (_info.option_type == 'NO' && ($.inArray(_info.optionJsonData, Array(undefined, null)) === -1 && object_count(_info.optionJsonData.basic) == 1 && (_info.optionJsonData.basic[0][0].opt_value === undefined || _info.optionJsonData.basic[0][0].opt_value == ''))) {
                _option_price = (_product_price * _stock).numeric();
            } else {
                _option_price = (_product_price * _stock).numeric() + _basic_price.numeric();
            }

            price_str = _this.comma(_option_price);

            // �ɼ����ΰ� : this.info[idx].optionprice �� �ݾ� ����
            _info.optionprice = price_str;

            // �ɼ����ΰ� �����±� ������ ����
            if ($("#optionprice" + idx) != undefined && $("#optionprice" + idx).text().length > 0) {
                price_value = $("#optionprice" + idx);
                $(price_value).text(price_str);
            }
        },

        // �ʼ��Է°� focus
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

        // �ɼǰ� ���� ó��
        change_option: function(obj, option_mode, idx) {
            // obj : select, input element
            var _this = this;
            var _info = this.info[idx];

            if (_info.view_member_only_price == 'Y' && typeof _info.IS_LOGIN != 'undefined' && _info.IS_LOGIN === 'false') {
                alert(((shop_language == 'eng') ? 'Member login required to buy.' : 'ȸ�� �α����� �Ͻø� �����Ͻ� �� �ֽ��ϴ�.'));
                return;
            }

            // �ɼ� ���� üũ
            // �����±� ������ �ּ��ֹ����ɼ������� ó��
            if ($('#MS_amount_basic_list_' + idx) != undefined && $('#MS_amount_basic_list_' + idx).val() != undefined) {
                var _stock = $('#MS_amount_basic_list_' + idx).val();
            } else {
                var _stock = _info.min_amount;
            }

            // �ʼ� �ɼ� üũ
            if (false === _this.check_mandatory(obj)) {
                _this.set_data(idx);
                _this.sum_total_price(idx, _stock);

                // ���û�ǰ �� �ݾ�
                _this.calculate_product_price();

                return false;
            }

            // �ɼ� ���� ������� ó��
            if ($(obj).val().replace(/[\s]/g, '').length == 0) {
                _this.set_data(idx);
                _this.sum_total_price(idx, _stock);

                // ���û�ǰ �� �ݾ�
                _this.calculate_product_price();

                return false;
            }

            if (false === _this.check_quantity(idx, _stock)) {
                _this.set_data(idx);
                _this.sum_total_price(idx, _stock);

                // ���û�ǰ �� �ݾ�
                _this.calculate_product_price();

                return false;
            }

            _this.set_data(idx);
            _this.sum_total_price(idx);

            // ���û�ǰ �� �ݾ�
            _this.calculate_product_price();

            return;
        },

        // �ɼ� �ʼ� �Է�/���� üũ
        check_mandatory: function(obj) {
            var _text = $(obj).get(0).tagName.toLowerCase() == 'input' ? get_lang('enter') : get_lang('select');
            if ($(obj).attr('require') == 'Y' && $(obj).val().replace(/[\s]/g, '').length == 0) {
                alert(get_lang('require_option', '', _text));
                return false;
            }
            return true;
        },

        // �ɼ� ������ üũ
        check_data: function(idx) {
            var _this = this;
            var _state = true;

            if (idx.length < 1 || idx == '' || idx == undefined) {
                return false;
            }

            var _info = _this.info[idx];

            // �ɼ��±� �̻���� �̰��� ������.
            if (_info.use_option_tag == "N") {
                return _state;
            }

            var option_node = $('[name="optionlist_list' + idx + '[]"].basic_option_list');

            // ���ɼ��� �׻� �Ǵ�.
            if (option_node.length < 1) {
                return _state;
            }

            // �ʼ��ɼ�
            // �⺻ �ɼ� ���� ���� üũ
            $.each(option_node, function(_i, _d) {
                // require == Y �⺻������ data�� ���� ���õǾ������Ƿ� element�� value�� üũ�ϸ��
                if ($(_d).get(0).tagName.toLowerCase() == 'input') {
                    if ($(_d).attr('require') == 'Y') {
                        var _text = '�ʼ� �ɼ��� ' + get_lang('enter') + '���� �ʾҽ��ϴ�.\n�ɼ��� �ݵ�� �Է��ϼ���.';

                        // �ڵ��Է°��� �����Ͽ� ���� ��츦 �ʼ��Է� �������� üũ
                        if ($(_d).val().replace(/[\s]/g, '').length < 1 || ($(_d).val().replace(/[\s]/g, '').length > 0 && $(_d).val() == $(_d).attr('title'))) {
                            _state = false;
                        }
                    }
                } else {
                    if ($(_d).attr('require') == 'Y') {
                        var _text = '�ʼ� �ɼ��� ' + get_lang('select') + '���� �ʾҽ��ϴ�.\n�ɼ��� �ݵ�� �����ϼ���.';
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

            // �⺻ �ɼǺ��� ���õ��� �ʾҴٸ� ������
            if (false === _state) {
                return _state;
            }
            return true;
        },

        // �ɼ��±� �̻�� + �ʼ��⺻�ɼ��� ������ ��ǰ ����
        prevent_mandatory : function(_idx) {
            var _this = this;
            var product_uids = [];
            var product_msg_str = null;
            var product_name_arr = [];

            if (_idx.length < 1 || _idx == '' || _idx == undefined) {
                return false;
            }

            // ���û�ǰ�� �پ��ϰ� ���´�.
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

                // �ɼ��±� �̵�� : �Ⱥ��� ��
                // �ʼ� �⺻�ɼ�X  : �Ⱥ��� ��
                if (_info.use_option_tag == "N" && _info.opt_mandatory_count > 0) {
                    product_name_arr.push("[" + _info.product_name + "]");
                }
            });

            // ��ǰ�� ������ �ش���� ����.
            if (product_name_arr.length < 1) {
                return true;
            }

            product_msg_str = product_name_arr.join(", ") + " ��ǰ�� ������������ �ɼ��� ���� ��, ����/��ٱ��� ��Ⱑ �����մϴ�.\n��ǰ�� �ٽ� �������ֽñ� �ٶ��ϴ�.";

            alert(product_msg_str);

            return false;
        },

        // ��ٱ��� �ִ��ǰ����
        isAddToCart : function(_idx, basket_tempid, isBaroBuy, isAll) {
            var _this            = this;
            var _target          = $("form[name=product_form]");
            var BasketMaxCount   = ($("#BasketMaxCount", _target).attr('id') == undefined) ? 200 : $("#BasketMaxCount", _target).val();
            var listBuyBuyOpt    = $("#listBuyBuyOpt", _target).val();
            var BasketBasam      = $("#BasketBasam", _target).val();
            var listBuyPvdOrderType = $("#listBuyPvdOrderType", _target).val(); // ������ ����� �����å
            var MOBILE_USE       = $("input[name=MOBILE_USE]", _target).val();
            var product_uids     = [];
            var now_basket_count = 0;
            var sum_basket_count = 0;
            var _tempid = ''; // ��ٱ��� tempid
            var _is_all = (isAll != undefined && isAll == 'all') ? 'Y' : 'N';  // ��ǰ���� ����
            var _state = false;

            // ���� ��ǰ�� ��
            var _bank_only = _card_only = _provider_uid = '';
            var check_basket_bank = check_basket_card = check_basket_provider = 0; // ���� ��ǰ ����/ī�����������ǰ ����
            var select_provider_arr = [];   // ���û�ǰ ���޾�ü
            var both_provider_arr   = [];   // select_provider_arr �ߺ����� ���޾�ü
            var basket_single_message = "��ٱ��Ͽ� ��� ��ǰ�� ��������� �޶� ��ٱ��Ͽ� ���� ���� �� �����ϴ�.\n������ �ֹ����� �ۼ����ֽñ� �ٶ��ϴ�. �����մϴ�.";
            var basket_select_message = baro_buy_message = "��������� �ٸ� ��ǰ�� ���ԵǾ� �־� ��ٱ��Ͽ� ���� ���� �� �����ϴ�.\n������ �ֹ����� �ۼ����ֽñ� �ٶ��ϴ�. �����մϴ�.";
            var provider_single_message = "��ٱ��Ͽ� ��� ��ǰ�� ��ǰ ���޾�ü�� �޶� ��ٱ��Ͽ� ���� ���� �� �����ϴ�.\n������ �ֹ����� �ۼ����ֽñ� �ٶ��ϴ�. �����մϴ�.";
            var provider_select_message = baro_provider_message = "��ǰ ���޾�ü�� �ٸ� ��ǰ�� ���ԵǾ� �־� ��ٱ��Ͽ� ���� ���� �� �����ϴ�.\n������ �ֹ����� �ۼ����ֽñ� �ٶ��ϴ�. �����մϴ�.";

            if (_idx.length < 1 || _idx == '' || _idx == undefined) {
                return false;
            }

            // ���û�ǰ�� �پ��ϰ� ���´�.
            if (false === $.isArray(_idx)) {
                product_uids.push(_idx);
            } else {
                product_uids = _idx;
            }

            if (product_uids.length < 1) {
                return false;
            }

            // ��������, ĳ�û������� tempid���� ����������
            // ������ �ѹ��̶� �̵��ϸ� tempid����Ƿ� ajaxó���� �����ǹǷ� ���� ���õ�
            if (basket_tempid != undefined && basket_tempid.length > 1 && basket_tempid != '') {
                _tempid = basket_tempid; 
            }

            $.each(product_uids, function(_i, _d) {
                _bank_only = _this.info[_d].bank_payment_only;
                _card_only = _this.info[_d].card_payment_only;
                _provider_uid = (_this.info[_d].provider_uid == '' || _this.info[_d].provider_uid.length < 1 || _this.info[_d].provider_uid == null) ? 0 : _this.info[_d].provider_uid;
                select_provider_arr.push(_provider_uid);

                if (_bank_only == 'Y') {	// �������������ǰ ����
                    check_basket_bank++;
                } else if (_card_only == 'Y') {	// ī�����������ǰ ����
                    check_basket_card++;
                }
            });

            // ���� ��ǰ ���������ǰ ��
            // �ٷα��� ��ٱ��ϻ�ǰ ������ ��� �ش�
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

                // ���� ��ǰ ���޾�ü ��
                // ������ٱ���1,2�� �̿�ÿ��� �����ں� üũ�� ���� �ʴ´�.
                if (listBuyPvdOrderType != 'HEADER' && listBuyPvdOrderType != 'EACH') {
                    if (select_provider_arr.length > 0) {
                        $.each(select_provider_arr, function(_i, _d) {
                            if ($.inArray(_d, both_provider_arr) === -1) {
                               both_provider_arr.push(_d); 
                            }
                        });
                    }

                    // ���޾�ü�� ��� 1�� �̻��̶�� ���� �ȵȴٴ°Ŵ�.
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
            // ���� ��ǰ�� �� END

            // basket���� �Ѿ�� ��� �ҽ� �� �Ȱ� �������⶧���� �̸�üũ�� �Ѵ�.
            // �ǽð� ��ٱ��� ����üũ�Ϸ��� �Ұ�����

            // ����̽� ȯ�濡 ���� url
            var _shopdetail_ajax_url = (MOBILE_USE != 'YES') ? './shopdetail.ajax.html' : './product.action.html';

            $.ajax({
                url: _shopdetail_ajax_url,
                type: 'POST',
                dataType: 'json',
                async : false, // [�ʼ�]
                data: { action_mode : 'list_buy_basket_count', basket_tempid : _tempid, pvd_order_type : listBuyPvdOrderType, baro_opt : listBuyBuyOpt },
                success: function(res) {
                    // ���� cart�� �ִ� ��ǰ��
                    now_basket_count = res.data;

                    // product_form�� �ǽð� ��ٱ��� ��ǰ���� �־���
                    $("#nowBasketCount", _target).val(now_basket_count);

                    // �ٷα��Ž� ��ٱ��� ��ǰ���� ���� + ���� cart ��ǰ 1�� �̻��� ��� ����
                    if (isBaroBuy == 'baro') {
                        if (listBuyBuyOpt == 'N') {
                            if (parseInt(now_basket_count) > 0) {
                                alert("��ٱ��Ͽ� ��� �ִ�, ��ǰ�� �Բ� �ֹ��˴ϴ�.\n��ġ ������ ��� ��ٱ��ϸ� ����ּ���.");
                            }
                        }
                    }

                    // �ٷα��� ��ٱ��ϻ�ǰ ���ܴ� �ش����.
                    if (listBuyBuyOpt != 'Y') {
                        var basket_bank_pay_status = res.basket_bank_pay_status;    // ��ٱ��� ������ǰ �������������ǰ ���� ����
                        var basket_card_pay_status = res.basket_card_pay_status;    // ��ٱ��� ������ǰ ī�����������ǰ ���� ����

                        // ������ٱ���1,2�� �̿�ÿ��� �����ں� üũ�� ���� �ʴ´�.
                        if (listBuyPvdOrderType != 'HEADER' && listBuyPvdOrderType != 'EACH') {
                            var basket_provider_status = res.basket_provider_status;    // ��ٱ��� ������ǰ ���޾�ü

                            // ��ٱ��� ��ǰ ���޾�ü üũ
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

                        // ��ٱ��� ��ǰ�� ��������� ��
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
                    // ��ٱ��� ��ǰ�� ��������� �� END

                    // ���Ͽɼǻ�ǰ ������� ���������� ��쿡�� ��ٱ��� �ִ� ��ǰ���� üũ�����ʰ� basket���� Ȯ���ϵ��� �Ѵ�.
                    if (BasketBasam == 'N') {
                        // ���� ��ٱ��� ��䰹�� + ��ǰ ����/���� ���� �ջ�
                        sum_basket_count = parseInt(now_basket_count) + parseInt(product_uids.length);

                        // ��ٱ��� �ִ� ��ǰ���� Ȯ��
                        if (sum_basket_count > BasketMaxCount) {
                            alert("��ٱ��Ͽ��� ��" +BasketMaxCount+ "�� ������ ���� �� �ֽ��ϴ�.");
                            return false;
                        }
                    }

                    _state = true;

                    return true;
                }
            });

            // 2�� Ȯ��
            if (false === _state) {
                return false;
            }

            return true;
        },

        // ���ϻ�ǰ �ɼǴ��
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

            // �ʼ� �ɼǵ��� �����ߴ��� üũ
            // ���ø���Ʈ�϶� üũ ����
            if (mode != 'wish') {
                if (false == _this.check_data(_idx)) {
                    return false;
                }

                // �ɼ� �����±� �̻�� �ʼ��ɼ� üũ
                if (false == this.prevent_mandatory(_idx)) {
                    return false;
                }

                // ��ٱ��� �ִ� ��ǰ���� Ȯ��
                if (false == _this.isAddToCart(_idx, listBuyTempid, isBaroBuy)) {
                    return false;
                }
            }

            // ���� ����
            $('.MS_option_values', $(_target)).remove();

            // ��ǰ�⺻�� ����
            _options.push('<input type="hidden" class="MS_option_values" name="brandcode"  value="' + _info.brandcode   + '" />');
            _options.push('<input type="hidden" class="MS_option_values" name="branduid"   value="' + _info.product_uid + '" />');
            _options.push('<input type="hidden" class="MS_option_values" name="adult_only" value="' + _info.adult_only  + '" />');

            // �����±� ������ �ּҼ��� ��
            if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + $("#MS_amount_basic_list_" + _idx).val() + '" />');
            } else {
                _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + _info.min_amount + '" />');
            }
            // �⺻������ _options.length�� 4�� ����

            // ���ø���Ʈ�� ��ǰ �ɼ� ����/��ǰ������ ���
            if (is_wish_opt == undefined || is_wish_opt == 'N') {
                // ��ǰ������ ����
                $(_target).append(_options.join('\n'));
                return true;
            }

            // ��ٱ��� �� wishlist �������� �ɼ�element ����
            // ���ɼ�
            if (_info.option_type == 'NO' && ($.inArray(_json, Array(undefined, null)) === -1 && object_count(_json.basic) == 1 && (_json.basic[0][0].opt_value === undefined || _json.basic[0][0].opt_value == ''))) {
                var _data = _this.data.basic[_idx][0];
                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_id]"    value="' + _data.opt_id +    '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_value]" value="' + _data.opt_value + '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_stock]" value="' + _data.opt_stock + '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][sto_id]"    value="' + _data.sto_id +    '" />');

            } else {
                // �⺻�ɼ�

                // �ɼǰ����±� �̻��
                if (_info.use_option_tag == 'N') {

                    // �ɼǰ����±� ������� �ʴ°��� �ɼ�element�� ����.
                    // �ٷα���, ��ٱ��Ͻÿ��� �ɼ��� �ʿ���.
                    // �ʱⰪ�� ������ �־��ش�.
                    if (_this.data.basic[_idx].length < 1) {
                        _this.set_data(_idx);
                    }

                    // �߰��� �ɼ��� �ִ� ��쿡 ����
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
                    // �ɼǰ� ���翡 ���� element üũ
                    // �����ɼ��� �⺻��ǰ�� cart�� ��� ���� �ɼ��� �ʿ���
                    var check_opt = $('[name="optionlist_list' +_idx+ '[]"].basic_option_list').eq(0).attr('name');

                    // �����ɼ�
                    if (check_opt == undefined) {
                        var _data = _this.data.basic[_idx][0];
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_id]"    value="' + _data.opt_id +    '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_value]" value="' + _data.opt_value + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_stock]" value="' + _data.opt_stock + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][sto_id]"    value="' + _data.sto_id +    '" />');

                    } else {
                        var _data = _this.data.basic[_idx];

                        $.each(_data, function(_i, _d) {
                            // �ɼǼ������� �ʴ� ��쿡�� element������ ����
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

                                // �����±� ������ �ּҼ��� ��
                                if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + $('#MS_amount_basic_list_' + _idx).val() + '" />');
                                } else {
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _info.min_amount + '" />');
                                }
                            } else {
                                // ������ �ɼ��� ����
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + _d.opt_id    + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + _d.opt_value + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _d.opt_stock + '" />');
                                _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="' + _d.sto_id    + '" />');
                            }

                            _no++;
                        });
                    }

                    // �߰��� �ɼ��� �ִ� ��쿡 ����
                    $('.MS_option_values', $(_target)).remove();

                    // ��ǰ�⺻������ ������ 4�̴�.
                    // �ɼ��� �������� ���� ���¿��� ���� element������ ����
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

                            // �����±� ������ �ּҼ��� ��
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

            // ������ �ɼ� input ������ append��
            $(_target).append(_options.join('\n'));
        },

        // ���û�ǰ �ɼǴ��
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

            // üũ���� Ȯ��
            if (prd_nodes == undefined || prd_nodes.length < 1) {
                alert('���õ� ��ǰ�� �����ϴ�. ��ǰ�� �������ּ���.');
                return false;
            }

            $.each(prd_nodes, function() {
                if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                    product_idx.push($(this).val());
                }
            });

            if (product_idx.length < 1) {
                alert('���õ� ��ǰ�� �����ϴ�. ��ǰ�� �������ּ���.');
                return false;
            }

            var basic_option_length = parseInt(product_idx.length * 4);

            // ���� ����
            $('.MS_option_values', $(_target)).remove();

            // üũ�� ��ǰ �� �ʼ� �ɼǵ��� �����ߴ��� üũ
            // ���ø���Ʈ�϶� üũ ����
            if (mode != 'wish') {
                $.each(product_idx, function(_i, prd_idx) {
                    if (false === _this.check_data(prd_idx)) {
                        ok_basket_state = false;
                        return false;
                    }
                });

                // �ð����� �ѹ��� Ȯ��
                if (false === ok_basket_state) {
                    return false;
                }

                // �ɼ� �����±� �̻�� �ʼ��ɼ� üũ
                if (false == _this.prevent_mandatory(product_idx)) {
                    return false;
                }

                // ��ٱ��� �ִ� ��ǰ���� Ȯ��
                if (false == _this.isAddToCart(product_idx, listBuyTempid, isBaroBuy, 'all')) {
                    return false;
                }

            } else {
                // mode=wish
                // ���ø���Ʈ�� ��ǰ �ɼ� ����/��ǰ������ ���
                if (is_wish_opt == undefined || is_wish_opt == '' || is_wish_opt == 'N') {
                    // ��ǰ�⺻���� ����
                    $.each(product_idx, function(_i, idx) {
                        _options.push('<input type="hidden" class="MS_option_values" name="brandcode[]"  value="' + _this.info[idx].brandcode   + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="branduid[]"   value="' + _this.info[idx].product_uid + '" />');
                        _options.push('<input type="hidden" class="MS_option_values" name="adult_only[]" value="' + _this.info[idx].adult_only  + '" />');

                        // �����±� ������ �ּҼ��� ��
                        if ($("#MS_amount_basic_list_" + idx) != undefined && $("#MS_amount_basic_list_" + idx).val() != undefined) {
                            _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + $("#MS_amount_basic_list_" + idx).val() + '" />');
                        } else {
                            _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + _this.info[idx].min_amount + '" />');
                        }
                    });

                    $(_target).append(_options.join('\n'));
                    return true;
                }
                // wishlist ���û�ǰ�� ��� END
            }

            // ���õ� ��ǰidx�� �ش��ϴ� �ɼǻ���
            $.each(product_idx, function(_i, _idx) {
                var _info = _this.info[_idx];
                var _option_name = 'option_list[basic][' +_i+ ']';
                var _json = _info.optionJsonData;
                var _no = 0;
                var _options = [];

                // ��ǰ�⺻�� ����
                _options.push('<input type="hidden" class="MS_option_values" name="brandcode[]"  value="' + _info.brandcode   + '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="branduid[]"   value="' + _info.product_uid + '" />');
                _options.push('<input type="hidden" class="MS_option_values" name="adult_only[]" value="' + _info.adult_only  + '" />');

                // �����±� ������ �ּ��ֹ��������� ��
                if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                    _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + $("#MS_amount_basic_list_" + _idx).val() + '" />');
                } else {
                    _options.push('<input type="hidden" class="MS_option_values" name="amount_list[]" value="' + _info.min_amount + '" />');
                }
                // ���û�ǰ�� 4���� ���δ�.

                // ���ɼ�
                if (_info.option_type == 'NO' && ($.inArray(_json, Array(undefined, null)) === -1 && object_count(_json.basic) == 1 && (_json.basic[0][0].opt_value === undefined || _json.basic[0][0].opt_value == ''))) {
                    var _data = _this.data.basic[_idx][0];

                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_id]"    value="' + _data.opt_id +    '" />');
                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_value]" value="' + _data.opt_value + '" />');
                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_stock]" value="' + _data.opt_stock + '" />');
                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][sto_id]"    value="' + _data.sto_id +    '" />');
                } else {

                    // �ɼǰ����±� �̻��
                    if (_info.use_option_tag == 'N') {

                        // �ɼǰ����±� ������� �ʴ°��� �ɼ�element�� ����.
                        // �ٷα���, ��ٱ��Ͻÿ��� �ɼ��� �ʿ���.
                        // �ʱⰪ�� ������ �־��ش�.
                        if (_this.data.basic[_idx].length < 1) {
                            _this.set_data(_idx);
                        }

                        // �߰��� �ɼ��� �ִ� ��쿡 ����
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
                        // �ɼǰ� ���翡 ���� element üũ
                        // �����ɼ��� �⺻��ǰ�� cart�� ��� ���� �ɼ��� �ʿ���
                        var check_opt = $('[name="optionlist_list' +_idx+ '[]"].basic_option_list').eq(0).attr('name');

                        if (check_opt == undefined) {
                            var _data = _this.data.basic[_idx][0];
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_id]"    value="' + _data.opt_id +    '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_value]" value="' + _data.opt_value + '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][opt_stock]" value="' + _data.opt_stock + '" />');
                            _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[0][sto_id]"    value="' + _data.sto_id +    '" />');

                        } else {
                            // �⺻�ɼ�
                            var _data = _this.data.basic[_idx];

                            $.each(_data, function(_i, _d) {
                                // �ɼǼ������� �ʴ� ��쿡�� element������ ����
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

                                    // �����±� ������ �ּҼ��� ��
                                    if ($("#MS_amount_basic_list_" + _idx) != undefined && $("#MS_amount_basic_list_" + _idx).val() != undefined) {
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + $('#MS_amount_basic_list_' + _idx).val() + '" />');
                                    } else {
                                        _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _info.min_amount + '" />');
                                    }
                                } else {
                                    // ������ �ɼ��� ����
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_id]"    value="' + _d.opt_id    + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_value]" value="' + _d.opt_value + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + _d.opt_stock + '" />');
                                    _options.push('<input type="hidden" class="MS_option_values" name="' + _option_name + '[' + _no + '][sto_id]"    value="' + _d.sto_id    + '" />');
                                }

                                _no++;
                            });
                        }

                        // �߰��� �ɼ��� �ִ� ��쿡 ����
                        $('.MS_option_values', $(_target)).remove();

                        // ��ǰ�⺻������ ������ 4��
                        // �ɼ��� �������� ���� ���¿��� ���� element������ ����
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

                                // �����±� ������ �ּҼ��� ��
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

            // ������ ��ǰ ����
            $("#listBuySelectCount", _target).val('Y');

            // ������ �ɼ� input ������ append��
            $(_target).append(total_options.join('\n'));
        },

        // �ǸŰ��ɻ�ǰ ���� üũ
        check_quantity: function(_idx, amount) {
            // ��ɱ���
            // �з����ſ� �ش��ϴ� ��ǰ�� �ǸŰ��ɼ����� ����̹Ƿ�, ��������� ������������
            // ���� ������ ���ż��� ���ؼ� �������ϸ� ��

            var _this                   = this;
            var product_uids            = [];
            var product_name_arr        = [];
            var product_quantity_arr    = [];
            var product_msg_str         = null;
            var product_msg_last_str    = "\n�����մϴ�.";
            var _state                  = false;
            var listBasketStock         = $("#product_form input[name=listBasketStock]").val();

            if (_idx.length < 1 || _idx == '' || _idx == undefined) {
                return _state;
            }

            // set_amount��ŭ �������� ����Ѵ�.
            // ���û�ǰ�� �پ��ϰ� ���´�.
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

                // ���� �ǸŰ����� ��ǰ����
                // amount���� ���Ͽ� �ʰ��� ��ǰ�� ���ؼ� ���ó��
                var now_quantity = parseInt(_info.quantity);

                if (amount > now_quantity) {
                    product_name_arr.push(_info.product_name);
                    product_quantity_arr.push(_info.quantity);
                }
            });

            // �ǸŰ����� ������ ���� ��ǰ�� ��� ����
            if (product_name_arr.length < 1) {
                _state = true;
                return _state;
            }

            $.each(product_name_arr, function(_i, _product_name) {
                if (listBasketStock == 'Y') {
                    product_msg_str = "[" +_product_name+ "] ��ǰ�� ����� ���� " +product_quantity_arr[_i]+ "�� �Դϴ�.\n����/��ǰ üũ�� �ٽ� �Ͻñ� �ٶ��ϴ�.";
                } else {
                    product_msg_str = "[" +_product_name+ "] ��ǰ�� ����� �����մϴ�.\n����/��ǰ üũ�� �ٽ� �Ͻñ� �ٶ��ϴ�.";
                }
            });

            alert(product_msg_str + product_msg_last_str);

            return _state;
        },

        // ��ǰ ȸ������ ���� Ȯ��(����,ȸ������)
        check_product_auth : function(idx, type) {
            var _this           = this;
            var info_cnt        = 0;
            var adult_only_cnt  = 0;    // �������������ǰ ����
            var _adult_state    = false;
            var _return_state   = false;

            if (idx == undefined || idx == '') {
                return _return_state;
            }

            // ������ǰ�� ���
            if (idx != 'ALL') {
                var _info = _this.info[idx];

                // �����������
                if (type == 'adult') {
                    if (_info.adult_only == 'Y') {
                        _return_state = true;
                    }
                }

                return _return_state;
                // ������ǰ END

            } else {
                // check product
                if (_this.info == undefined) {
                    return _return_state;
                }

                info_cnt = _this.info.length;

                if (info_cnt < 1) {
                    return _return_state;
                }

                // ���û�ǰ ���
                var prd_nodes = $('.MS_product_checkbox');

                // ���û�ǰ ������ �н�
                if (prd_nodes == undefined || $(prd_nodes).eq(0).val() == undefined) {
                    return _return_state;
                }

                // üũ�� ��ǰ �� �����ǰ Ȯ��
                if (prd_nodes.length > 0) {
                    $.each(prd_nodes, function(_i) {
                        if (true == $(this).is(":checked") && $(this).attr('disabled') != 'disabled') {
                            // ����������� ��ǰ üũ
                            if (type == 'adult') {
                                if (_this.info[_i] != undefined && _this.info[_i].adult_only == 'Y') {
                                    adult_only_cnt++;
                                }
                            }
                        }
                    });
                }

                // �������������ǰ ������ ��쿡 �������� ���
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