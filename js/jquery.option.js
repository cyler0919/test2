var StringBuffer = function() {
    this.buffer = new Array();
};

StringBuffer.prototype.append = function(str) {
    this.buffer[this.buffer.length] = str;
};

StringBuffer.prototype.toString = function() {
    return this.buffer.join('');
};

// ���ڰ� �ƴ� ���ڴ� ��� ����
String.prototype.numeric = function() {
    return parseInt(this.replace(/[^-0-9]/g, '') || 0, 10);
};
Number.prototype.numeric = function() {
    return this.toString().numeric();
};

// õ���� �޸� ���̱�
String.prototype.number_format = function() {
    return this.numeric().toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
};
Number.prototype.number_format = function() {
    return this.toString().number_format();
};

if (typeof shop_language == 'undefined') {
    var shop_language = 'kor';
}

var prd_cart_cnt = prd_cart_cnt || 0;

function object_count(obj) {
    var cnt = 0;
    for (var i in obj) {
        cnt++;
    }
    return cnt;
}

;(function($) {
    window.option_manager = {
        info: {
            min_amount: parseInt(min_amount), // �ּ� �ֹ� ����
            min_add_amount: parseInt(min_add_amount), // �ֹ� ���� ����
            max_amount: parseInt(max_amount), // �ִ� �ֹ� ����
            prd_cart_cnt : parseInt(prd_cart_cnt),
            product_uid: product_uid, // ��ǰ uid
            product_brandcode: null,
            product_name: product_name, // ��ǰ��
            product_price: product_price, // ��ǰ����
            option_type: option_type, // �ɼ� ����
            option_display_type: option_display_type, // �ɼ� ��� Ÿ��
            json: optionJsonData, // ���� ������ ����� JSON ���
            type: null, // ���� ���õ� �ɼ��� Ÿ��
            view_member_only_price : view_member_only_price // ȸ�����ݳ��� ����
        },
        data: {
            basic: [[]],
            prd_info: [],
            addition: []
        },
        get_cart_amount: function() {
            return this.info.prd_cart_cnt;
        },
        // return min amount
        get_min_amount: function(mode) {
            return mode.toLowerCase() == 'addition' ? 1 : this.info.min_amount;
        },
        // return min add amount
        get_min_add_amount: function(mode) {
            return mode.toLowerCase() == 'addition' ? 1 : this.info.min_add_amount;
        },
        // return min amount
        get_max_amount: function(mode) {
            return mode.toLowerCase() == 'addition' ? 2147483647 : this.info.max_amount;
        },
        // input box focus in action
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
        // ��Ŭ�� �ɼ� ����
        click_option: function(obj, option_mode, target) {

            var _this = this;
            var _info = this.info;
            var _json = this.info.json.basic;
            var _obj = $(obj);

            var _li = _obj.parents('.MK-oneclick-li');
            var _ul = _obj.parents('.MK-oneclick-list');
            var _key = parseInt(_obj.attr('opt_key'));
            var _option = $('[name="optionlist[]"].' + option_mode + '_option');
            var _input = _option.filter('[opt_key="'+_key+'"]');
            var _value_text = $('.MK-oneclick-value[opt_key='+_key+']');
            
            if (_li.hasClass('MK-oneclick-dis') === true) {
                return;
            }

            // �������
            if (_li.hasClass('MK-oneclick-sel') === true) {
                 _li.removeClass('MK-oneclick-sel'); 
                 if (_value_text) {
                     _value_text.html('');
                 }
                this.unset_child_option(option_mode, _option, _key);
                this.set_data();
                this.sum_total_price();

                if (typeof oneclick_change_mimg != 'undefined') {
                    oneclick_change_mimg('');
                }
                return;
            }
            if (typeof shop_language == 'undefined') {
                var shop_language = 'kor';
            }
            if (option_manager.info.view_member_only_price == 'Y' && IS_LOGIN === 'false') {
                alert(((shop_language == 'eng') ? 'Member login required to buy.' : 'ȸ�� �α����� �Ͻø� �����Ͻ� �� �ֽ��ϴ�.'));    
                return;
            }

            // �ɼ� ���� ������� ó��
            if (_obj.attr('title').replace(/[\s]/g, '').length == 0) {
                this.unset_child_option(option_mode, _option, _key);
                return false;
            }

            // �ɼ� ���� üũ
            var _stock = 0;
            if (option_mode == 'basic') {
                _stock = $('#MS_amount_basic_0').val();
            }
            if (this.check_quantity(obj, option_mode, _stock) === false) {
                this.unset_child_option(option_mode, _option, _key);
                return false;
            }

            // ���� �ɼ� select ������ �ɼ� ��� disable
            _input.val(_obj.attr('value'));
            _li.addClass('MK-oneclick-sel').siblings('.MK-oneclick-li').removeClass('MK-oneclick-sel');

            // �����ɼ� �����
            _this.remove_option(_key);
            if (_option.eq(_key + 1).attr('opt_mix') == 'Y') {
                _this.append_option(_option, _key + 1);
            }

            if (_value_text) {
                _value_text.html(_obj.attr('title'));
            }

            // �������Է�
            _this.set_oneclick_data();
            this.set_data();
            this.sum_total_price();
            return false;
        },
        // �ɼǰ� ����
        remove_option: function(idx) {
            var _this = this;
            $.each($('[name="optionlist[]"].basic_option'), function(_i, _d) {
                if (idx < _i && $(this).attr('opt_mix') == 'Y') {
                    if ($(this).attr('opt_oneclick') && $(this).attr('opt_oneclick') == 'Y') {
                        var _ul = $('.MK-oneclick-list[opt_key='+_i+']');
                        _ul.find('.MK-oneclick-li').addClass('MK-oneclick-dis').removeClass('MK-oneclick-sel');
                        var _text = $('.MK-oneclick-value[opt_key='+_i+']');
                        if (_text) {
                            _text.html('');
                        }
                    } else {
                        $(this).children('option').not(':first').remove();
                    }
                }
            });
        },
        // �ɼǰ� ���� ó��
        change_option: function(obj, option_mode, target) {
            if (option_manager.info.view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === 'false') {
                alert(((shop_language == 'eng') ? 'Member login required to buy.' : 'ȸ�� �α����� �Ͻø� �����Ͻ� �� �ֽ��ϴ�.'));
                return;
            }

            // ���� ���õ� �ɼ��� Ÿ���� ������
            this.info.type = $(obj).get(0).tagName.toLowerCase();
            var _option = $('[name="optionlist[]"].' + option_mode + '_option');
            var _idx = _option.index($(obj));

            // �ʼ� �ɼ� üũ
            if (this.check_mandatory(obj) === false) {
                this.unset_child_option(option_mode, _option, _idx);
                return false;
            }

            // �ɼ� ���� ������� ó��
            if ($(obj).val().replace(/[\s]/g, '').length == 0) {
                this.unset_child_option(option_mode, _option, _idx);
                this.set_data();
                this.sum_total_price();
                return false;
            }

            // ���õ� �ɼ��� ���� �ɼ��� ������ ���ۼ���
            // ���� �ɼǵ��� �ɼǰ��� ������ �� �ɼ� ���� �߰���
            if (option_mode == 'basic') {
                this.remove_option(_idx);
                if (_option.eq(_idx + 1).attr('opt_mix') == 'Y') {
                    this.append_option(_option, _idx + 1);
                }
            }

            // �ɼ� ���� üũ
            var _stock = 0;
            if (option_mode == 'basic') {
                _stock = $('#MS_amount_basic_0').val();
            } else {
                var _i = $('[name="optionlist[]"].' + option_mode + '_option').index($(obj));
                _stock = $('#MS_amount_addition_' + _i).val();
            }
            if (this.check_quantity(obj, option_mode, _stock) === false) {
                this.unset_child_option(option_mode, _option, _idx);
                return false;
            }

            this.set_data();
            this.sum_total_price();
            return false;
        },
        // �ɼ� ���� ���
        unset_child_option: function(option_mode, option, idx) {
            if (option_mode != 'basic') {
                return false;
            }
            if (option.eq(idx).attr('opt_mix') != 'Y') {
                return false;
            }
            if (option.eq(idx + 1).attr('opt_mix') == 'Y') {
                this.remove_option(idx);
                this.set_data();
                this.sum_total_price();
            }
        },
        // ���� �ɼ� ���� Ȯ��
        use_child_option: function(idx, _opt_ids, _opt_values) {
            var _info = this.info;
            var _json = this.info.json.basic;
            var _count = 0;
            var _hcount = 0;
            $.each(_json[idx], function(_i, _d) {
                if (_d.opt_mix == 'Y' && _opt_ids == _d.opt_ids.substring(0, _opt_ids.length) && $.trim(_opt_values + ',') == $.trim(_d.opt_values).substring(0, $.trim(_opt_values).length + 1)) {
                    if (_d.sto_state == 'HIDE') {
                        _hcount++;
                    }
                    _count++;
                }

            })
            return _count == _hcount ?  false : true;

        },
        // ������� �ɼ� Ȯ��
        check_show_option: function(_opt_ids, _opt_values) {
            var _info = this.info;
            var _json = this.info.json.basic;
            var _use = false;
            $.each(_json, function(_idx, _data) {
                $.each(_data, function(_i, _d) {

                    if (_d.opt_mix == 'Y' && $.inArray(_opt_ids, _d.opt_ids.split(',')) == _idx && $.inArray(_opt_values, _d.opt_values.split(',')) == _idx) {
                        if (_d.sto_state != 'HIDE') {
                            _use = true;
                            return false;
                        }
                    }
                })
                if (_use === true) {
                    return false;
                }
            })
            return _use;
        },
        // ��Ŭ�� �ɼ� Ȱ��ȭ
        append_option_oneclick: function(options, idx) {

            var _this = this;
            var _info = this.info;
            var _json = this.info.json.basic;
            var _option = new StringBuffer();

            
            var _ul = $('.MK-oneclick-list[opt_key='+idx+']');
            _ul.find('.MK-oneclick-dis').removeClass('MK-oneclick-dis').removeClass('MK-oneclick-sel');
            _ul.find('.MK-oneclick-li').show();

            //return false;

            // ���յ� �ɼ��� ���¿� ���� �ؽ�Ʈ �߰�
            if (idx == options.index(options.filter('[opt_mix="Y"]:last'))) {
                var _opt_id = [];
                var _opt_value = [];

                // ���� �ɼǵ��� ���õ� �ɼ��� opt_id, opt_value ���� ��Ƶ�
                var _select_option =_this.get_selected_option(options);
                var _opt_id = _select_option[0];
                var _opt_value = _select_option[1];

                var _opt = null;
                var _in_opt = false;
                var _opt_ids = null;
                _ul.find('.MK-oneclick-link').each(function() {
                    _in_opt = false;
                    _opt = $(this); // ���� �ɼǰ�
                    // opt_id, opt_value ���� ���ս�Ŵ
                    _opt_ids = _opt_id.length > 0 ? _opt_id.join(',') + ',' + _ul.attr('opt_id') : _ul.attr('opt_id');
                    _opt_values = _opt_value.length > 0 ? _opt_value.join(',') + ',' + $(this).attr('opt_val') : $(this).attr('opt_val');
                    // json������ �ش� opt_ids, opt_value���� ã��
                    $.each(_json[idx], function(_i, _d) {
                        if (_opt_ids == _d.opt_ids && $.trim(_opt_values) == $.trim(_d.opt_values)) {
                            var _add_text = '';
                            var _add_price = '';
                            var _text = _opt.attr('opt_val');
                            var _is_unlimit = _d.sto_unlimit == 'Y' ? true : false;
                             //�и����϶� ���� ���� �ɼ� ����
                            if (_d.sto_state == 'HIDE') {
                                _opt.closest('.MK-oneclick-li').hide();
                                return true;
                            }

                            // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                            if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                                _add_price = '';
                            } else {
                                // �и����� ��� �߰��ݾ��� �߰�����
                                if (_d.sto_price > 0) {
                                    _add_price = '(+' + Math.abs(parseInt(_d.sto_price, 10)).number_format() + ')';
                                    _opt.attr('price', Math.abs(parseInt(_d.sto_price, 10)));
                                } else if (_d.sto_price < 0) {
                                    _add_price = '(-' + Math.abs(parseInt(_d.sto_price, 10)).number_format() + ')';
                                    _opt.attr('price', Math.abs(parseInt(_d.sto_price, 10)));
                                }
                            }
                            switch (_d.sto_state) {
                                case 'HIDE': _opt.closest('.MK-oneclick-li').hide(); break;
                                case 'SOLDOUT': 
                                    _add_text = ' - ' + get_lang('soldout_txt'); 
                                    _opt.closest('.MK-oneclick-li').addClass('MK-oneclick-dis');
                                    break;
                                case 'TEMPOUT': 
                                    _add_text = ' - ' + get_lang('tempsoldout_txt'); 
                                    _opt.closest('.MK-oneclick-li').addClass('MK-oneclick-dis');
                                    break;
                                case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                                case 'SALE':
                                    if (_is_unlimit === true) {
                                        _add_text = '';
                                    } else if (_d.sto_stop_use == 'Y' && (_d.sto_real_stock - _d.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                        _opt.closest('.MK-oneclick-li').addClass('MK-oneclick-dis');
                                        _add_text = ' - ' + get_lang('soldout_txt');
                                    }

                                    if (option_stock_display != 'NO' && _add_text.length == 0) {
                                        if (_d.sto_stop_use == 'Y') {
                                            _add_text = ' - (' + get_lang('stock_title') + ' : ' + Math.max(0, _d.sto_real_stock - _d.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                        } else {
                                            _is_unlimit = true;
                                        }
                                        if (_is_unlimit === true) {
                                            if (option_stock_display == 'DISPLAY') {
                                                _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                            }
                                            if (option_stock_display == 'LIMIT') {
                                                _add_text = '';
                                            }
                                        }
                                    }
                                    break;
                            }
                            if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && _d.sto_note.length > 0) {
                                _add_text += '(' + _d.sto_note.substr(0, 20) + ')';
                            }
                            _in_opt = true;
                            _opt.attr('title', (_text + _add_price + _add_text));
                        }
                    })
                    // �и����� ��� ���յ��� ���� �ɼ��� �����Ҽ� ���� �ش� �ɼ��� ǰ�� ó��
                    if (_in_opt === false) { _opt.closest('.MK-oneclick-li').hide(); }
                });
            } else {
                if (_ul.attr('opt_mix') == 'Y') {

                    // ���� �ɼǵ��� ���õ� �ɼ��� opt_id, opt_value ���� ��Ƶ�
                    var _select_option =_this.get_selected_option(options);
                    var _opt_id = _select_option[0];
                    var _opt_value = _select_option[1];

                    var _opt_ids = null;
                    var _opt_values = null;
                    $.each(_ul.find('.MK-oneclick-link'), function(_i, _d) {
                        _opt_ids = _opt_id.length > 0 ? _opt_id.join(',') + ',' + _ul.attr('opt_id') : _ul.attr('opt_id');
                        _opt_values = _opt_value.length > 0 ? _opt_value.join(',') + ',' + $(this).attr('opt_val') : $(this).attr('opt_val');
                        if (option_manager.use_child_option(idx, _opt_ids, _opt_values) === false) {
                                    
                            $(this).parents('.MK-oneclick-li').hide();
                        }
                    });
                }
            }
            return false;
        },
        // ���� �ɼǵ��� ���õ� �ɼ��� opt_id, opt_value ���� ����
        get_selected_option: function (options) {
            var _opt_id = [];
            var _opt_value = [];
            $.each(options, function(_i, _d) {
                if ($(this).attr('opt_oneclick') && $(this).attr('opt_oneclick') == 'Y') {
                    var _option_key = $(this).attr('opt_key');
                    var _opt = $('.MK-oneclick-sel[opt_key='+_option_key+']').find('.MK-oneclick-link');
                    if (_opt.length > 0 && $(this).attr('opt_mix') == 'Y' && _opt.attr('value').length > 0) {
                        _opt_id.push($(this).attr('opt_id'));
                        _opt_value.push(_opt.attr('opt_val'));
                    }
                } else {
                    var _opt = $(this).children('option:selected');
                    if ($(this).attr('opt_mix') == 'Y' && _opt.text() != get_lang('non_option_txt') && _opt.val().length > 0) {
                        _opt_id.push($(this).attr('opt_id'));
                        _opt_value.push($(this).children('option:selected').attr('title'));
                    }
                }
            });
            return [_opt_id, _opt_value];
        },
        // ��Ŭ�� ���õ� �� hidden�� �־���
        set_oneclick_data: function () {
            var _opt_id = [];
            var _opt_value = [];
            $.each($('input[name="optionlist[]"].basic_option'), function(_i, _d) {
                if ($(this).attr('opt_oneclick') && $(this).attr('opt_oneclick') == 'Y') {
                    var _option_key = $(this).attr('opt_key');
                    var _opt = $('.MK-oneclick-sel[opt_key='+_option_key+']').find('.MK-oneclick-link');
                    if (_opt.length > 0 && _opt.attr('value').length > 0) {
                        $(this).val(_opt.attr('value'));
                        $(this).attr('opt_val', _opt.attr('opt_val'));
                    } else {
                        $(this).val('');
                        $(this).attr('opt_val', '');
                    }
                }
            });
            return true;
        },
        // �ɼǰ� �߰�
        append_option: function(options, idx) {

            var _this = this;
            var _info = this.info;
            var _json = this.info.json.basic;
            var _option = new StringBuffer();
            if (_json[idx] !== undefined) {

                // ��Ŭ�� �ɼ��� ��� �и�
                if ($(options.eq(idx).get(0)).attr('type') == 'hidden') {
                    this.append_option_oneclick(options, idx);
                    return false;
                }
                // ���� �ɼ��� �Է����̶�� option�� �߰��� �ʿ䰡 ����
                if (options.eq(idx).get(0).tagName.toLowerCase() == 'input') {
                    return false;
                }
                var _num = 0;
                var _add_price = '';
                $.each(_json[idx], function(_i, _d) {
                    if (_i == 0 && _d.opt_mandatory == 'N') {
                        _option.append('<option sto_id="0" price="0" title="' + get_lang('non_option_txt') + '" value="' + _num + '" style="color: #ff0000;">' + get_lang('non_option_txt') + '</option>');
                        _num++;
                    }
                    if (_info.option_display_type == 'EACH' && _d.opt_mix == 'Y') {
                        _add_price = '';
                        // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                        if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                            _add_price = '';
                        } else {
                            if (_d.sto_price > 0) {
                                _add_price = '(+' + (Math.abs(_d.sto_price)).number_format() + ')';
                            } else if (_d.sto_price < 0) {
                                _add_price = '(-' + (Math.abs(_d.sto_price)).number_format() + ')';
                            }
                        }
                        _option.append('<option matrix="" sto_id="' + _d.sto_id + '" price="' + _d.sto_price + '" title="' + _d.opt_values + '" value="' + _num + '">' + _d.opt_values + _add_price + '</option>\n');
                    } else {
                        var _value = _d.opt_value.split(',');
                        var _price = _d.opt_price.split(',');
                        var _matrix = _d.opt_matrix.split(',');
                        $.map(_value, function(_v, _k) {
                            if (_d.opt_mix == 'Y') {
                                _option.append('<option matrix="' + _matrix[_k] + '" sto_id="0" price="0" title="' + _v + '" value="' + _num + '">' + _v + '</option>\n');
                            } else {
                                _add_price = '';
                                // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                                if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                                    _add_price = '';
                                } else {
                                    if (_price[_k] > 0) {
                                        _add_price = '(+' + (Math.abs(_price[_k])).number_format() + ')';
                                    } else if (_price[_k] < 0) {
                                        _add_price = '(-' + (Math.abs(_price[_k])).number_format() + ')';
                                    }
                                }
                                _option.append('<option matrix="' + _matrix[_k] + '" sto_id="0" price="' + _price[_k] + '" title="' + _v + '" value="' + _num + '">' + _v + _add_price + '</option>\n');
                            }
                            _num++;
                        });
                    }
                    _num++;
                    // �ɼ� ��� ���°� �и����϶� ���յ� �ɼ��� ���
                    if (_info.option_display_type == 'EVERY' && _json[idx][0].opt_mix == 'Y') {
                        return false;
                    }
                });
                // �ϼ��� �ɼ��� �߰���
                $(options).eq(idx).children('option').not(':first').remove().end().end().append(_option.toString());

                // �ɼ��� ���¿� ���� �ؽ�Ʈ �߰�
                if (idx == options.index(options.filter('[opt_mix="Y"]:last'))) {

                    // ���� �ɼǵ��� ���õ� �ɼ��� opt_id, opt_value ���� ��Ƶ�
                    var _select_option =_this.get_selected_option(options);
                    var _opt_id = _select_option[0];
                    var _opt_value = _select_option[1];

                    var _opt = null;
                    var _in_opt = false;
                    var _opt_ids = null;
                    $(options).eq(idx).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")').each(function() {
                        _in_opt = false;
                        _opt = $(this); // ���� �ɼǰ�
                        // opt_id, opt_value ���� ���ս�Ŵ
                        _opt_ids = _opt_id.length > 0 ? _opt_id.join(',') + ',' + $(this).parents('select:first').attr('opt_id') : $(this).parents('select:first').attr('opt_id');
                        _opt_values = _opt_value.length > 0 ? _opt_value.join(',') + ',' + $(this).attr('title') : $(this).attr('title');
                        // json������ �ش� opt_ids, opt_value���� ã��
                        $.each(_json[idx], function(_i, _d) {
                            if (_opt_ids == _d.opt_ids && $.trim(_opt_values) == $.trim(_d.opt_values)) {
                                var _add_text = '';
                                var _add_price = '';
                                var _text = _opt.text();
                                var _is_unlimit = _d.sto_unlimit == 'Y' ? true : false;
                                 //�и����϶� ���� ���� �ɼ� ����
                                if (_d.sto_state == 'HIDE') {
                                    _opt.remove();
                                    return true;
                                }

                                // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                                if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                                    _add_price = '';
                                } else {
                                    // �и����� ��� �߰��ݾ��� �߰�����
                                    if (_d.sto_price > 0) {
                                        _add_price = '(+' + Math.abs(parseInt(_d.sto_price, 10)).number_format() + ')';
                                        _opt.attr('price', parseInt(_opt.attr('price')) + Math.abs(parseInt(_d.sto_price, 10)));
                                    } else if (_d.sto_price < 0) {
                                        _add_price = '(-' + Math.abs(parseInt(_d.sto_price, 10)).number_format() + ')';
                                        _opt.attr('price', parseInt(_opt.attr('price')) - Math.abs(parseInt(_d.sto_price, 10)));
                                    }

                                    // �ǸŰ� ���������� ��� (discount_percent)
                                    _opt.attr('org_opt_price', Math.abs(parseInt(_d.org_opt_price, 10)));
                                }
                                switch (_d.sto_state) {
                                    case 'HIDE': _add_text = ' - ' + get_lang('soldout_txt'); break;
                                    case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                                    case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                                    case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                                    case 'SALE':
                                        if (_is_unlimit === true) {
                                            _add_text = '';
                                        } else if (_d.sto_stop_use == 'Y' && (_d.sto_real_stock - _d.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                            _add_text = ' - ' + get_lang('soldout_txt');
                                        }

                                        if (option_stock_display != 'NO' && _add_text.length == 0) {
                                            if (_d.sto_stop_use == 'Y') {
                                                _add_text = ' - (' + get_lang('stock_title') + ' : ' + Math.max(0, _d.sto_real_stock - _d.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                            } else {
                                                /*
                                                if (_d.sto_real_stock < 0) {
                                                    _is_unlimit = true;
                                                } else {
                                                    _add_text = ' - (' + get_lang('stock_title') + ' : ' + _d.sto_real_stock + ' ' + get_lang('stock_unit') + ')';
                                                }
                                                */
                                                _is_unlimit = true;
                                            }
                                            if (_is_unlimit === true) {
                                                if (option_stock_display == 'DISPLAY') {
                                                    _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                                }
                                                if (option_stock_display == 'LIMIT') {
                                                    _add_text = '';
                                                }
                                            }
                                        }
                                        break;
                                }

                                if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && _d.sto_note.length > 0) {
                                    _add_text += '(' + _d.sto_note.substr(0, 20) + ')';
                                }
                                _in_opt = true;
                                _opt.text(_text + _add_price + _add_text);
                            }
                        })
                        // �и����� ��� ���յ��� ���� �ɼ��� �����Ҽ� ���� �ش� �ɼ��� ǰ�� ó��
                        if (_in_opt === false) { _opt.remove(); }
                    });
                    //�и����϶� ������� �ɼ� ���Ž� ���õǾ��� �ɼǰ��� �ʱ�ȭ
                    /*
                    if ($(options).eq(idx).children('option').not('[value=""]').length <= 0) {
                        alert(get_lang('empty_option'));
                        $('[name="optionlist[]"]').val('').focus();
                        return false;

                    }
                    */
                } else {
                    if (option_manager.info.option_display_type == 'EVERY') {
                        // ���� �ɼǵ��� ���õ� �ɼ��� opt_id, opt_value ���� ��Ƶ�
                        var _select_option =_this.get_selected_option(options);
                        var _opt_id = _select_option[0];
                        var _opt_value = _select_option[1];

                        var _opt = null;
                        var _opt_ids = null;
                        var _opt_values = null;
                        $(options).eq(idx).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")').each(function() {
                            _opt = $(this); // ���� �ɼǰ�
                            // opt_id, opt_value ���� ���ս�Ŵ
                            _opt_ids = _opt_id.length > 0 ? _opt_id.join(',') + ',' + $(this).parents('select:first').attr('opt_id') : $(this).parents('select:first').attr('opt_id');
                            _opt_values = _opt_value.length > 0 ? _opt_value.join(',') + ',' + $(this).attr('title') : $(this).attr('title');
                            if ($(this).parents('select:first').attr('opt_mix') == 'Y' && _this.use_child_option(idx, _opt_ids, _opt_values) === false) {
                                _opt.remove();
                            }
                        });
                    }

                }
            }
            return false;
        },
        // �ɼ� �ʼ� �Է�/���� üũ
        check_mandatory: function(obj) {

            var _is_oneclick = ($(obj).attr('opt_oneclick') && $(obj).attr('opt_oneclick') === 'Y');
            var _text = $(obj).get(0).tagName.toLowerCase() == 'input' &&  _is_oneclick !== true ? get_lang('enter') : get_lang('select');
            if ($(obj).attr('require') == 'Y' && $(obj).val().replace(/[\s]/g, '').length == 0) {
                alert(get_lang('require_option', '', _text));
                return false;
            }
            return true;
        },
        // �ɼ� ���� üũ
        check_quantity: function(obj, option_mode, stock, k_no) {
            var _this = this;
            var _info = this.info;
            var _option = $('[name="optionlist[]"].' + option_mode + '_option');
            var _sto_id = null;
            var _sto_state = null;
            var _sto_unlimit = null;
            var _sto_real_stock = 0;
            var _sto_stop_use = null;
            var _sto_stop_stock = null;
            var _quantity_state = true; // �ɼ� ���� ���� ��
            var _quantity_mode = (obj.tagName !== undefined);
            var _is_oneclick = false;

            if (_this.data['prd_info'] != '' && _this.data['prd_info'] != undefined) {
                if (k_no != undefined) {
                    _info = _this.data['prd_info'][k_no];    
                }
            }
            if (obj.tagName && obj.tagName.toLowerCase() == 'a') {
                // ��Ŭ��
                var _idx = $(obj).attr('opt_key');
                _is_oneclick = true;
            } else {
                var _idx = _option.index($(obj));
            }

            if (_quantity_mode === true) {
                if (option_mode == 'basic') {
                    switch (_info.option_display_type) {
                        case 'EACH':
                            if (_info.json[option_mode][_idx][0].opt_mix == 'Y') {
                                _sto_id = _info.json[option_mode][_idx][$(obj).val()].sto_id;
                                _sto_state = _info.json[option_mode][_idx][$(obj).val()].sto_state;
                                _sto_unlimit = _info.json[option_mode][_idx][$(obj).val()].sto_unlimit;
                                _sto_real_stock = _info.json[option_mode][_idx][$(obj).val()].sto_real_stock;
                                _sto_stop_use = _info.json[option_mode][_idx][$(obj).val()].sto_stop_use;
                                _sto_stop_stock = _info.json[option_mode][_idx][$(obj).val()].sto_stop_stock;
                            }
                            break;
                        case 'EVERY':
                            var _opt_id = [];
                            var _value = [];
                            $.each(_option, function(_i, _d) {
                                // ��Ŭ��

                                if ($(this).attr('opt_oneclick') && $(this).attr('opt_oneclick') == 'Y') {
                                    var _option_key = $(this).attr('opt_key');
                                    var _key = $('.MK-oneclick-sel[opt_key='+_option_key+']').find('.MK-oneclick-link').attr('value');
                                } else {
                                    var _key = $(this).children('option:selected').val();
                                }
                                if (_info.json[option_mode][_i][0].opt_mix == 'Y' && _key !== undefined && _key.length > 0) {
                                    if (_info.json[option_mode][_i][_key] === undefined) {
                                        _opt_id.push(0);
                                    } else {
                                        _opt_id.push(_info.json[option_mode][_i][_key].opt_id);
                                    }
                                    _value.push(_info.json[option_mode][_i][0].opt_value.split(',')[_key]);
                                }
                            });

                            $.each(_info.json[option_mode][_idx], function(_i, _d) {
                                if (_d.opt_ids == _opt_id.join(',') && _d.opt_values == _value.join(',')) {
                                    _sto_id = _d.sto_id;
                                    _sto_state = _d.sto_state;
                                    _sto_unlimit = _d.sto_unlimit;
                                    _sto_real_stock = _d.sto_real_stock;
                                    _sto_stop_use = _d.sto_stop_use;
                                    _sto_stop_stock = _d.sto_stop_stock;
                                }
                            });
                            break;
                    }
                } else {
                    if ($.isEmptyObject(_info.json[option_mode][_idx]) === false) {
                        _sto_id = _info.json[option_mode][_idx][$(obj).val()].sto_id;
                        _sto_state = _info.json[option_mode][_idx][$(obj).val()].sto_state;
                        _sto_unlimit = _info.json[option_mode][_idx][$(obj).val()].sto_unlimit;
                        _sto_real_stock = _info.json[option_mode][_idx][$(obj).val()].sto_real_stock;
                        //_sto_stop_use = _info.json[option_mode][_idx][$(obj).val()].sto_stop_use;
                        //_sto_stop_stock = _info.json[option_mode][_idx][$(obj).val()].sto_stop_stock;
                        _sto_stop_use = 'Y'; // �����ɼ��� ������ �������
                        _sto_stop_stock = 0;
                    }
                }
            } else {
                $.each(_info.json[option_mode], function(idx, data) {
                    if (_sto_real_stock > 0) {return false;}
                    $.each(data, function(key, value) {
                        if (obj.opt_id == value.opt_ids && obj.opt_value == value.opt_values) {
                            _sto_unlimit = value.sto_unlimit;
                            _sto_real_stock = value.sto_real_stock;
                            _sto_stop_use = value.sto_stop_use;
                            _sto_stop_stock = value.sto_stop_stock;
                            return false;
                        }
                    });
                });
                _sto_id = obj.sto_id;
                _sto_state = obj.sto_state;
            }

            if (_info.option_type == 'NO') {
                var _json = _info.json.basic[0][0];
                _sto_id = _json.sto_id;
                _sto_state = _json.sto_state;
                _sto_unlimit = _json.sto_unlimit;
                _sto_real_stock = _json.sto_real_stock;
                _sto_stop_use = _json.sto_stop_use;
                _sto_stop_stock = _json.sto_stop_stock;
            }

            if (_sto_id !== null && _sto_id > 0) {
                switch (_sto_state) {
                    case 'SOLDOUT':
                    case 'TEMPOUT':
                    case 'HIDE':
                        var _txt = (_sto_state == 'TEMPOUT') ? get_lang('temporary') : '';
                        // �Ͻ� ǰ���� ��� '�Ͻ�' �޽��� �߰�
                        if (_info.option_type == 'NO') {
                            alert(get_lang('selected_product_soldout', ''));
                        } else {
                            alert(get_lang('selected_option_soldout', _txt));
                        }

                        if (_is_oneclick ===  false) {
                            $(obj).val('').focus();
                        }
                        _quantity_state = false;
                        
                        if ($('.MS_package_checkbox')) {
                            $('#package_sodout_type').val('N');
                            $('#check_package_basket_'+k_no).attr('checked',false);
                        }
                        break;
                    default:
                        if (_sto_unlimit == 'N') {
                            if (_sto_stop_use == 'Y') {
                                if ((_sto_real_stock - _sto_stop_stock) <= 0) {
                                    alert(get_lang('selected_option_soldout', ''));
                                    if (_is_oneclick ===  false) {
                                        $(obj).val('').focus();
                                    }
                                    _quantity_state = false;
                                } else if ((_sto_real_stock - _sto_stop_stock) < stock.numeric()) {
                                    alert(get_lang('selected_option_lower_quantity'));
                                    if (_quantity_mode === true && _is_oneclick ===  false) {
                                        $(obj).val('').focus();
                                    }
                                    _quantity_state = false;
                                }
                            } else {
                                /*
                                if (_sto_real_stock < stock.numeric()) {
                                    alert(get_lang('selected_option_lower_quantity'));
                                    if (_quantity_mode === true) {
                                        $(obj).val('').focus();
                                    }
                                    _quantity_state = false;
                                }
                                */
                            }
                        }
                        break;
                }
            }

            return _quantity_state;
        },
        // �ɼ� ������ üũ
        check_data: function() {
            var _this = this;
            var _state = true;

            // �⺻ �ɼ� ���� ���� üũ
            $.each($('[name="optionlist[]"].basic_option'), function(_i, _d) {
                var _is_oneclick = ($(this).attr('opt_oneclick') && $(this).attr('opt_oneclick') === 'Y');
                var _text = $(this).get(0).tagName.toLowerCase() == 'input' && _is_oneclick != true ? get_lang('enter') : get_lang('select');
                if ($(this).attr('require') == 'Y') {
                    if (_this.data.basic[0][_i] === undefined || _this.data.basic[0][_i].opt_id === undefined) {
                        alert(get_lang('require_option', '', _text));
                        $(this).focus();
                        _state = false;
                        return false;
                    }
                }
            });

            // �⺻ �ɼǺ��� ���õ��� �ʾҴٸ� ������
            if (_state === false) {
                return _state;
            }

            // ���� �ɼ� ���� ���� üũ
            $.each($('[name="optionlist[]"].addition_option'), function(_i, _d) {
                if ($(this).attr('require') == 'Y') {
                    if (_this.data.addition[_i] === undefined || _this.data.addition[_i].opt_id === undefined) {
                        alert(get_lang('require_option', '', '����'));
                        $(this).focus();
                        _state = false;
                        return false;
                    }
                }
            });
            return _state;
        },
        // �ɼ� ������ �ʱ�ȭ
        unset_data: function() {
            // ���� ����� ���� �ʱⰪ ����
            if ($('[name="optionlist[]"].basic_option').length > 0) {
                this.data.basic = [[]];
            }
            this.data.addition = [];
        },
        // �ɼ� ������ �߰�
        set_data: function() {
            var _this = this;

            // ��Ŭ�� ������ Ȯ��
            _this.set_oneclick_data();

            _this.unset_data(); // ������ �ʱ�ȭ �� ������ ���� ����
            $.each($('[name="optionlist[]"].basic_option'), function(_i, _d) {
                var _is_oneclick = ($(this).attr('opt_oneclick') && $(this).attr('opt_oneclick') === 'Y');
                if ($(this).val().length > 0 && $(this).val() != $(this).attr('title')) {

                    if (_is_oneclick === true) {
                        var _opt = $('.MK-oneclick-sel[opt_key='+$(_d).attr('opt_key')+']').find('.MK-oneclick-link');
                        _this.data.basic[0].push({
                            opt_id:     $(_d).attr('opt_id') || '0',
                            opt_type:   $(_d).attr('opt_type') || '0',
                            opt_value:  _opt.attr('opt_val'),
                            opt_stock:  $('#MS_amount_basic_0').val() || 1,
                            opt_price:  _opt.attr('price') || '0',
                            sto_id:     _opt.attr('sto_id') || '0'
                        });
                    } else if ($(this).get(0).tagName.toLowerCase() == 'input') {
                        _this.data.basic[0].push({
                            opt_id: $(this).attr('opt_id') || '0',
                            opt_type: $(this).attr('opt_type'),
                            opt_value: $(this).val(),
                            opt_stock: $('#MS_amount_basic_0').val() || 1,
                            opt_price: '0',
                            sto_id: $(this).attr('sto_id') || '0'
                        });
                    } else {
                        _this.data.basic[0].push({
                            opt_id: $(this).attr('opt_id') || '0',
                            opt_type: $(this).attr('opt_type'),
                            opt_value: $(this).children('option:selected').attr('title'),
                            opt_stock: $('#MS_amount_basic_0').val() || 1,
                            opt_price: $(this).children('option:selected').attr('price') || '0',
                            sto_id: $(this).children('option:selected').attr('sto_id') || '0'
                        });
                    }
                } else {
                    _this.data.basic[0].push({});
                }
            });

            $.each($('[name="optionlist[]"].addition_option'), function(_i, _d) {
                var _addition_data = [];
                if ($(this).val().length > 0) {
                    _addition_data.push({
                        opt_id: $(this).attr('opt_id') || '0',
                        opt_value: $(this).children('option:selected').attr('title'),
                        opt_stock: $('#MS_amount_addition_' + _i).val() || 1,
                        opt_price: $(this).children('option:selected').attr('price') || '0',
                        sto_id: $(this).children('option:selected').attr('sto_id') || '0'
                    });
                    _this.data.addition.push(_addition_data);
                } else {
                    _addition_data.push({});
                    _this.data.addition.push(_addition_data);
                }
            });
            return true;
        },
        set_stock: function(obj, stock) {
            if (obj === undefined) {return false;}
            $.each(obj, function(_i, _d) {
                _d.opt_stock = stock;
            });
        },
        // �ɼ� ���� ���� ó��
        set_amount: function(obj, option_mode, mode) {
            // �ɼ� ���� ������� ó��
            if (typeof $(obj).val() == 'undefined' || $(obj).val().replace(/[\s]/g, '').length == 0) {
                this.set_data();
            }
            var _this = this;
            var _obj = typeof obj === 'string' ? $('#' + obj) : $(obj);
            var _idx = typeof obj === 'string' ? obj.replace('MS_amount_' + option_mode + '_', '') : $(obj).attr('id').replace('MS_amount_' + option_mode + '_', '');
            var _option_amount = $(_obj).filter('input.' + option_mode + '_option');
            var _amount = _obj.val().numeric();
            var _data = option_mode == 'basic' ? _this.data[option_mode][0][_idx] : _this.data[option_mode][_idx];

            // ��Ű�� ��ǰ��� ����ǰ���� �ּ�/�ִ� ���� �� üũ�ǵ��� ��
            if ($('#package_maxorder_count'+_idx).val() != undefined) {
                var _maxorder_count = $('#package_maxorder_count'+_idx).val();
            }  else {
                var _maxorder_count = this.get_max_amount(option_mode);
            }
            if ($('#package_minorder_count'+_idx).val() != undefined) {
                var _minorder_count = $('#package_minorder_count'+_idx).val();
            }  else {
                var _minorder_count = this.get_min_amount(option_mode);
            }

            if (_amount.length == 0) {
                alert(get_lang('quantity_numbers'));
                _this.set_stock(_this.data[option_mode][_idx], _minorder_count);
                _obj.val(_minorder_count);
                return false;
            }

            if(_amount == 0) {
                _amount = '';
            }

            /**
             * 2017. 12. 01 
             * this.get_min_amount(option_mode) -> _minorder_count ����
             */
             // ��ǰ �ּҼ��� ������ �ּҼ����� ���� (�ּҼ�����������ŭ ����/����) ó��
             if (this.get_min_add_amount(option_mode) != 1 && (_amount % this.get_min_add_amount(option_mode)) != 0) {
                 _amount = this.get_min_add_amount(option_mode) * Math.floor(_amount / this.get_min_add_amount(option_mode));
                 if (_amount == 0) {                                                                                                   
                     _amount = this.get_min_add_amount(option_mode);                                                                   
                 }
             }                                               
             // ���������� �� ����
             switch (mode) {
                 case 'up': _amount += this.get_min_add_amount(option_mode); break;
                 case 'down': _amount -= this.get_min_add_amount(option_mode); break;
             }

            if (_amount < _minorder_count) {
                alert(get_lang('min_amount', _minorder_count));
                _this.set_stock(_this.data[option_mode][_idx], _minorder_count);
                _obj.val(_minorder_count);
                return false;
            }
            
            if (_amount.length != 0 && _amount < 1) {
                alert(get_lang('min_amount2', _minorder_count));
                _this.set_stock(_this.data[option_mode][_idx], _minorder_count);
                _obj.val(_minorder_count);
                return false;
            }

            if (_amount > _maxorder_count) {
                alert(get_lang('max_amount', _maxorder_count));
                _this.set_stock(_this.data[option_mode][_idx], _maxorder_count);
                _obj.val(_maxorder_count);
                return false;
            }

            if (_data !== undefined) {
                var _stock_state = true;
                // ��Ʈ��ǰ üũ�ڽ��� �����ϴ°��
                if ($('.MS_package_checkbox')) {
                    if (_this.data[option_mode][0][_idx]) {
                        if (_this.check_quantity(_this.data[option_mode][0][_idx], option_mode, _amount, _idx) === false) {
                            // ���+��Ʈ��ǰ üũ�ڽ� �̿�� ǰ������ üũ
                            //$('#package_sodout_type').val('Y');
                            _stock_state = false;
                            //return false;
                        }
                    }
                } else {
                    if (_this.data[option_mode][_idx] !== undefined) {
                        $.each(_this.data[option_mode][_idx], function(key, value) {
                            if (value.sto_id > 0) {
                                if (_this.check_quantity(value, option_mode, _amount) === false) {
                                    // ���+��Ʈ��ǰ üũ�ڽ� �̿�� ǰ������ üũ
                                    $('#package_sodout_type').val('Y');
                                    _stock_state = false;
                                    //return false;
                                }
                            }
                        });
                    }
                }
                // ������ �����Ҽ� ���� ��쿣 ���⼭ ����
                if (_stock_state === false) {
                    if (mode === undefined) {
                        _this.set_stock(_this.data[option_mode][_idx], _minorder_count);
                        _obj.val(_minorder_count);
                        _this.sum_total_price();
                    }
                    return false;
                }
            }

            if (_data !== undefined) {
                _this.set_stock(_this.data[option_mode][_idx], _amount.toString());
            }

            // ���� ����
            _obj.val(_amount);
            if (this.info.option_type != 'NO') {
                _this.sum_total_price();
            }

            //whitesal 

            if(document.getElementById('option_type_wh')) {
                var optionobj = document.getElementById('option_type_wh').value;
            } 
            
            if (optionobj != 'NO' && optionobj != '') {
                return;
            }
            
            // �޸� ���
            function comma(n) {
                if (isNaN(n))
                    return 0;

                var reg = /(^[+-]?\d+)(\d{3})/;     // ���Խ�
                n += '';                            // ���ڸ� ���ڿ��� ��ȯ
                while (reg.test(n))
                    n = n.replace(reg, '$1' + ',' + '$2');
                return n;
            }

            // �ݾ� ������ ���ڿ� ����
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

            // ��ǲ�ڽ� ��������.
            jQuery(document).ready(function(){
                    jQuery("#goods_amount").change(function(){
                        var amount = parseInt(document.getElementById('goods_amount').value);
                        if(!amount) {amount = 1;}
                        document.getElementById('goods_amount').value = _amount;
                        amount = parseInt(document.getElementById('goods_amount').value);
                        set_amount(this, 'basic', 'up');
                        });
                    });

            // �ǸŰ���
            var price_value = document.getElementById('pricevalue');
            if(price_value) {
                var price = parseInt(document.getElementById('price_wh').value.replace(/,/g, ''), 10);
                var total_str = change_price_str(price_value, price, _amount);
                if(total_str)
                    price_value.innerHTML = total_str;
            }
            
            // ���ΰ���
            var dc_price_value = document.getElementById('change_discount_price_wh');
            if(dc_price_value) {
                var price = parseInt(document.getElementById('disprice_wh').value.replace(/,/g, ''), 10);
                var total_str = change_price_str(dc_price_value, price, _amount);
                if(total_str)
                    dc_price_value.innerHTML = total_str;
            }
        },
        // �ɼ� �Ѱ��� ���
        sum_total_price: function() {
            var _product_price = this.info.product_price.numeric();
            var _basic_price = 0;
            var _basic_single_price = 0;
            var _addition_price = 0;
            var _option_price = 0;
            var _stock = 1;

            // �⺻�ɼ� �Ѱ��� ���
            $.map(this.data.basic, function(data, idx) {
                if (data.length == 0) {return true;}
                $.map(data, function(_d, _i) {
                    if (_d !== undefined && _d.opt_id !== undefined) {
                        if (_d.opt_type == 'SINGLE') {
                            // ���Ϻΰ�
                            _basic_single_price += _d.opt_price.numeric();
                        } else {
                            // �ߺ��ΰ�
                            _basic_price += _d.opt_price.numeric();
                        }
                        if (_d.opt_stock !== undefined && _d.opt_stock.length > 0) {
                            _stock = _d.opt_stock.numeric();
                        }
                    }
                });
            });
            _basic_price *= _stock;
            _basic_price += _basic_single_price;
            var opt_sum_price = 0;
            var opt_sum_value = 0;
            $('input[name="hy_option[]"]').each(function(i) {
                if ($(this).is(':checked') === true) {
                    var _chk_id = $(this).attr('id').replace("chk_","");
                    var str_id = _chk_id.substr(0,1);
                    var opt_price = $(this).attr('opt_price');
                    var cnt = $('#hy_qrt_'+ _chk_id).val();
                    opt_sum_value += opt_price.numeric() * cnt.numeric();
                }
            });

            // �����ɼ� �Ѱ��� ���
            $.map(this.data.addition, function(data, idx) {
                if (data.length == 0) {return true;}
                // ������ Ÿ���� ��ٱ��� �˾��� ��ǰ �󼼰� �ٶ� type casting ����
                data = data.length > 0 ? data : Array(data);
                $.map(data, function(_d, _i) {
                    if (_d !== undefined && _d.opt_id !== undefined) {
                        _addition_price += _d.opt_price.numeric() * _d.opt_stock.numeric();
                    }
                });
            });

            // �⺻�ɼ�, �����ɼ� ������ ���� ����� ���ɼ��� �ֱ⿡ ���� �������
            // option_type == 'NO' �� ��� ������ ���� �ٸ�
            if (this.info.option_type == 'NO') {
                _option_price = (_product_price * _stock).numeric();
            } else {
                _option_price = (_product_price * _stock).numeric() + _basic_price.numeric() + _addition_price.numeric() + opt_sum_value.numeric();
            }
            if ($('#price_text').length == 0) {
                $('#MK_p_total').text(_option_price.number_format());
            } else {
                $('#price_text').text(_option_price.number_format());
            }

            if ($('#price_text_usd') && typeof exchange_rate != 'undefined' && typeof shop_language != 'undefined' && shop_language == 'eng') {
                $('#price_text_usd').text(price_exchange(exchange_rate, _option_price));
            }
        },
        print_option: function(form_name, mode) {
            var _this = this;
            var _info = this.info;
            var _json = this.info.json;
            var _options = [];

            // �ʼ� �ɼǵ��� �����ߴ��� üũ
            // ���ø���Ʈ�϶� üũ ����
            if (mode != 'wish' && this.check_data() === false) {
                return false;
            }

            var _opt_id = [];
            var _opt_value = [];
            // ���յ� �ɼ��ε� sto_id�� ���� ���� �ʴٸ� ã�� ���� �˻� ���� ������
            $.each(this.data.basic[0], function(idx, data) {
                if (data === undefined || data.opt_id === undefined) {return true;}
                if (_json.basic[idx][0].opt_mix == 'Y' && data.sto_id == 0) {
                    _opt_id.push(data.opt_id);
                    _opt_value.push(data.opt_value);
                }
            });

            var _dummy = null;
            _opt_id = _opt_id.join(',');
            _opt_value = _opt_value.join(',');
            // ������ �˻� ���� �̿��� sto_id�� ã�� �ش� data�� _dummy�� ����
            if (_opt_id.length > 0 && _opt_value.length > 0) {
                $.each(_json.basic, function() {
                    if (_dummy === null) {
                        $.each(this, function(idx, data) {
                            if (_opt_id == data.opt_ids && $.trim(_opt_value) == $.trim(data.opt_values)) {
                                _dummy = data;
                                return false;
                            }
                        });
                    } else {
                        return false;
                    }
                });
            }

            // ��ٱ��� ������ ���� �ɼ� element ����
            $.each(this.data, function(option_mode, datas) {
                var _no = 0;
                var _dummy_key = 0;
                // �⺻/���� �ɼǿ� ���� element name�� �޸� �ϱ� ����
                var _option_name = option_mode == 'basic' ? 'option[basic][0]' : 'option[addition]';
                // �⺻/���� �ɼǿ� ���� ����ϴ� �����Ͱ� �ٸ�
                datas = option_mode == 'basic' ? datas[0] : datas;
                $.each(datas, function(idx, data) {
                    // �����Ͱ� ���� ��� �ǳʶ�
                    if (option_mode == 'addition') {data = data[0];}
                    if (data === undefined || data.opt_id === undefined) {
                        var _opt = $('[name="optionlist[]"].' + option_mode + '_option:eq(' + idx + ')');
                        if (_opt.get(0).tagName.toLowerCase() == 'input') {
                            _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_id]" value="' + _opt.attr('opt_id') + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('no_input_txt') + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + $('#MS_amount_basic_0').val() + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][sto_id]" value="0" class="MS_option_values" />');
                        } else {
                            _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_id]" value="' + _opt.attr('opt_id') + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_value]" value="' + get_lang('non_option_txt') + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + $('#MS_amount_basic_0').val() + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][sto_id]" value="0" class="MS_option_values" />');
                        }
                    } else {
                        if (option_mode == 'basic' && _dummy !== null && _json[option_mode][idx][0].opt_mix == 'Y') {
                            _dummy_key = idx; // ���յ� �ɼ��� �迭 Ű���� ����
                            return true;
                        }
                        _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_id]" value="' + data.opt_id + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_value]" value="' + data.opt_value + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + data.opt_stock + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][sto_id]" value="' + data.sto_id + '" class="MS_option_values" />');
                    }
                    _no++;
                });
                // ���� �ɼǿ� ���� element�� ������
                if (option_mode == 'basic' && _dummy !== null) {
                    _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_id]" value="' + _dummy.opt_ids + '" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_value]" value="' + _dummy.opt_values + '" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][opt_stock]" value="' + datas[_dummy_key].opt_stock + '" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="' + _option_name + '[' + _no + '][sto_id]" value="' + _dummy.sto_id + '" class="MS_option_values" />');
                }
            });

            // �߰��� �ɼ��� ���� ��� ����
            $('input.MS_option_values').remove();
            // ���õ� �ɼ��� �ϳ��� ���� ��� ó��
            if (_options.length == 0) {
                $.each($('[name="optionlist[]"].basic_option'), function(_i, _d) {
                    if ($(this).get(0).tagName.toLowerCase() == 'input') {
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_id]" value="' + $(this).attr('opt_id') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_value]" value="' + get_lang('no_input_txt') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_stock]" value="' + $('#MS_amount_basic_0').val() + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][sto_id]" value="0" class="MS_option_values" />');
                    } else {
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_id]" value="' + $(this).attr('opt_id') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_value]" value="' + get_lang('non_option_txt') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_stock]" value="' + $('#MS_amount_basic_0').val() + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][sto_id]" value="0" class="MS_option_values" />');
                    }
                });

                $.each($('[name="optionlist[]"].addition_option'), function(_i, _d) {
                    _options.push('<input type="hidden" name="option[addition][' + _i + '][opt_id]" value="' + $(this).attr('opt_id') + '" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="option[addition][' + _i + '][opt_value]" value="' + get_lang('non_option_txt') + '" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="option[addition][' + _i + '][opt_stock]" value="1" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="option[addition][' + _i + '][sto_id]" value="0" class="MS_option_values" />');
                });
            }

            if (option_type == 'HYBRID') {
                var idx = 0;
                var option_chk = false;
                var _cnt = $('#MS_basic_product').val();
                var _opt_id = '';
                var group_stock = [];
                var group_min_amount = [];
                var group_name = [];
                $('input[name="hy_option[]"]').each(function() {
                    var _option_name = 'option[basic]['+ idx +'][0]';
                    var _option_title = $(this).attr('opt_title');
                    var _opt_stock = $('#' + $(this).attr('sto_key').replace('key', 'hy_qrt')).val();
                    var amount_min = $(this).attr('amount_min').split(",");
                    _opt_id = $(this).attr('opt_id');
                    group_min_amount[parseInt(_opt_id)] = parseInt(amount_min[1]);
                    group_name[parseInt(_opt_id)] = _option_title;
                    if($(this).is(':checked') == true) {
                        if (group_stock[parseInt(_opt_id)] > 0) {
                            group_stock[parseInt(_opt_id)] += parseInt(_opt_stock);
                        } else {
                            group_stock[parseInt(_opt_id)] = parseInt(_opt_stock);
                        }
                        _options.push('<input type="hidden" name="amount[]" value="'+ _cnt +'" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="' + _option_name + '[opt_id]" value="'+ $(this).attr('opt_id') +'" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="' + _option_name + '[opt_value]" value="'+ $(this).attr('opt_name') +'" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="' + _option_name + '[opt_stock]" value="'+ _opt_stock +'" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="' + _option_name + '[sto_id]" value="'+ $(this).attr('sto_id') +'" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="' + _option_name + '[prd_stock]" value="'+ _cnt+'" class="MS_option_values" />');
                        idx++;
                        option_chk = true; 
                    }  else {
                        if (group_stock[parseInt(_opt_id)] > 0) {
                            group_stock[parseInt(_opt_id)] += 0;
                        } else {
                            group_stock[parseInt(_opt_id)] = 0;
                        }
                    }
                });
                if (option_chk === false) {
                    alert(get_lang('not_selected'));
                    return false;
                }
                
                // ���̺긮�� �׷캰 �ɼ� �ּҼ��� üũ
                for (var i = 1; i <= group_stock.length; i++) {
                    if (group_stock[i] < group_min_amount[i]) {
                        alert(group_name[i] + '�ɼǱ׷��� �ּ� ���� ������ (' + group_min_amount[i] + ') �Դϴ�.');
                        return false;
                    }
                }
            }

            // ������ �ɼ� input ������ append��
            $('form[name="' + form_name + '"]').append(_options.join('\n'));
        }
    };

    // ���� ��ǰ ���� ��ũ��Ʈ
    window.related_product_manager = {
        // �ʼ� �ɼ� ���� ���� üũ
        check_mandatory: function() {
            var _state = true;
            try {
                $('input[name="collbasket"]').each(function(_i, _v) {
                    // option�� idx���� �˾Ƴ��� ���� :checked ��� ����.
                    var idx = _i;
                    if($('input[name="package_basket"]').length > 0) {
                        idx += $('input[name="package_basket"]').length;
                    }    
                    if ($(this).is(':checked') === true) {
                        $('[name="optionlist' + idx + '[]"]').each(function() {
                            var _value = $(this).val().replace(/[\s]/g, '');
                            if (this.type == 'text' && $(this).attr('title').replace(/[\s]/g, '') == _value) {
                                _value = '';
                            }
                            if ($(this).attr('require') == 'Y' && _value.length == 0) {
                                throw($(this));
                            }
                        });
                    }
                });
            } catch (obj) {
                var _text = $(obj).get(0).tagName.toLowerCase() == 'input' ? get_lang('enter') : get_lang('select');
                alert(get_lang('require_option', '', _text));
                $(obj).focus();
                _state = false;
            }
            return _state;
        },
        print_option: function(form_name) {
            if ($('input[name="collbasket"]:checked').length == 0 && $('input[name=collbasket_type]').val() == 'A') {
                alert(get_lang('not_select_product'));
                return false;
            }

            // ���տɼ� ��Ʈ��ǰ üũ�ڽ����� & ��ٱ��� ���û�ǰ��⼳�� �������ΰ�� üũ�� ��ǰ������� ���â ���� 
            if ($('input[name="collbasket"]:checked').length == 0 && $('input[name=collbasket_type]').val() == 'Y' && $('input[name=package_chk_val]').val() == 0 && $('#package_num').val() > 0) {
                if ($('input[name="package_basket"]').length > 0) {
                    alert(get_lang('not_select_product'));
                    return false;
                }
            }
            if (this.check_mandatory() === false) {
                return false;
            }
            var _options = [];
            var key_no = 0;
            $('input[name="collbasket"]').each(function(idx, _v) {
                var realIndex = idx;
                if($('input[name="package_basket"]').length > 0) {
                    idx += $('input[name="package_basket"]').length;
                }    
                // ��Ʈ��ǰ�ǰ�� key ���� �ߺ��Ǵºκ����� ���� 
                if($('input[name="package_num"]').val() > 0) {
                    key_no = parseInt($('input[name="package_num"]').val()) + idx;
                } else {
                     if($('input[name="package_basket"]').length > 0) {
                        key_no += $('input[name="package_basket"]').length; 
                     } else {
                        key_no += idx;
                     }
                } 

                // option�� idx���� �˾Ƴ��� ���� :checked ��� ����.
                if ($(this).is(':checked') === true) {
                    var _related_uid = eval('related_uid' + idx);
                    var _related_brandcode = eval('related_brandcode' + idx);
                    var _related_amount = $('[name="quantity"].MS_related_quantity:eq(' + realIndex + ')').val();
                    var _option_data = eval('related_option_json_data' + idx);
                    var _option_type = eval('related_option_type' + idx);
                    var _option_display_type = eval('related_option_display_type' + idx);

                    _options.push('<input type="hidden" name="add_product[' + key_no + '][uid]" value="' + _related_uid + '" class="MS_related_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + key_no + '][brandcode]" value="' + _related_brandcode + '" class="MS_related_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option_type]" value="' + _option_type + '" class="MS_related_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + key_no + '][amount]" value="' + _related_amount + '" class="MS_related_option_values" />');

                    // NO �ɼ��� ��� ������ ���� ���� ����
                    if (_option_type == 'NO' || ($.inArray(_option_data, Array(undefined, null)) === -1 && object_count(_option_data.basic) == 1 && _option_data.basic[0][0].opt_value === undefined)) {
                        _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][0][opt_id]" value="0" class="MS_related_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][0][opt_value]" value="" class="MS_related_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][0][opt_stock]" value="' + _related_amount + '" class="MS_related_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][0][sto_id]" value="' + _option_data.basic[0][0].sto_id + '" class="MS_related_option_values" />');
                    } else {
                        var _dummy = [];
                        var _select = [];
                        $.each($('[name="optionlist' + idx + '[]"]'), function(_i, _d) {
                            // ���տɼǰ� ������ ������ �����͸� �����ϱ� ���� �ӽ� ������ ��� �д�
                            if (_option_data.basic[_i][0].opt_mix == 'Y') {
                                var _t = {};
                                _t.stock_key = _i; // ���� �������� Ű���� ��� ��
                                _t.opt_stock = _related_amount.numeric();
                                _t.opt_id = $(this).attr('opt_id');
                                _t.opt_value = $(this).children('option:selected').attr('title');
                                _dummy.push(_t);
                            } else {
                                _select.push($(this));
                            }
                        });

                        var _opt_num = 0;
                        $.each(_select, function(_i, _d) {
                            var _opt_id = $(_d).attr('opt_id') || 0;
                            if ($(_d).get(0).tagName.toLowerCase() == 'input') {
                                var _opt_value = ($(_d).attr('title') == $(_d).val()) ? '' : $(_d).val();
                            } else {
                                var _opt_value = $(_d).children('option:selected').attr('title') || '';
                            }
                            var _sto_id = $(_d).children('option:selected').attr('sto_id') || 0;

                            _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_id]" value="' + _opt_id + '" class="MS_related_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_value]" value="' + _opt_value + '" class="MS_related_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_stock]" value="' + _related_amount + '" class="MS_related_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][sto_id]" value="' + _sto_id + '" class="MS_related_option_values" />');
                            _opt_num++;
                        });

                        if (_dummy.length > 0) {
                            var _data = {};
                            var _opt_ids = [];
                            var _opt_values = [];
                            var _amount = 0;
                            $.each(_dummy, function(_i, _d) {
                                _data = _option_data.basic[_d.stock_key];
                                _opt_ids.push(_d.opt_id);
                                _opt_values.push(_d.opt_value);
                                _amount = _d.opt_stock;
                            });

                            $.each(_data, function(_i, _d) {
                                if (_d.opt_ids == _opt_ids.join(',') && _d.opt_values == _opt_values.join(',')) {
                                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_id]" value="' + _d.opt_ids + '" class="MS_related_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_value]" value="' + _d.opt_values + '" class="MS_related_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_stock]" value="' + _amount + '" class="MS_related_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][sto_id]" value="' + _d.sto_id + '" class="MS_related_option_values" />');
                                }
                            });
                        }
                    }
                }
            });

            // �߰��� �ɼ��� ���� ��� ����
            $('input.MS_related_option_values').remove();
            // ������ �ɼ� input ������ append��
            $('form[name="' + form_name + '"]').append(_options.join('\n'));
        }
    };

    // ���� ��ǰ ���� ��ũ��Ʈ
    window.wish_product_manager = {
        // �ʼ� �ɼ� ���� ���� üũ
        check_mandatory: function(eq) {
            var _state = true;
            try {
                $('input[name="brchks[]"]').each(function(_i, _v) {
                    // option�� idx���� �˾Ƴ��� ���� :checked ��� ����.
                    var idx = _i;
                    var is_chk = false;
                    if($('input[name="package_basket"]').length > 0) {
                        idx += $('input[name="package_basket"]').length;
                    }    
                    if (typeof eq == 'undefined') {
                        is_chk = $(this).is(':checked') === true ? true : false;
                    } else {
                        is_chk = (_i == eq) ? true : false;
                    }
                    if (is_chk === true) {
                        $('[name="optionlist' + idx + '[]"]').each(function() {
                            if ($(this).attr('require') == 'Y' && $(this).val().replace(/[\s]/g, '').length == 0) {
                                throw($(this));
                            }
                        });
                    }
                });
            } catch (obj) {
                var _text = $(obj).get(0).tagName.toLowerCase() == 'input' ? get_lang('enter') : get_lang('select');
                alert(get_lang('require_option', '', _text));
                $(obj).focus();
                _state = false;
            }
            return _state;
        },
        print_option: function(form_name, eq) {
            // eq�� ���� ���� ���� ��ǰ�� ������ ���
            if (typeof eq == 'undefined') {
                if ($('input[name="brchks[]"]:checked').length == 0) {
                    alert(get_lang('not_select_product'));
                    return false;
                }
            }

            if (this.check_mandatory(eq) === false) {
                return false;
            }
            var _options = [];
            var key_no = 0;
            $('input[name="brchks[]"]').each(function(idx, _v) {
                var is_chk = false;
                var realIndex = idx;
                if (typeof eq == 'undefined') {
                    if($('input[name="package_basket"]').length > 0) {
                        idx += $('input[name="package_basket"]').length;
                    }    
                    // ��Ʈ��ǰ�ǰ�� key ���� �ߺ��Ǵºκ����� ���� 
                    if($('input[name="package_num"]').val() > 0) {
                        key_no = parseInt($('input[name="package_num"]').val()) + idx;
                    } else {
                         if($('input[name="package_basket"]').length > 0) {
                            key_no += $('input[name="package_basket"]').length; 
                         } else {
                            key_no += idx;
                         }
                    } 
                }

                // option�� idx���� �˾Ƴ��� ���� :checked ��� ����.
                if (typeof eq == 'undefined') {
                    is_chk = ($(this).is(':checked') === true) ? true : false;
                } else {
                    is_chk = (idx == eq) ? true : false;
                }
                if (is_chk === true) {
                    var _wish_uid = eval('wish_uid' + idx);
                    var _wish_brandcode = eval('wish_brandcode' + idx);
                    var _wish_amount = $('[name="order_quantity[]"]:eq(' + realIndex + ')').val();
                    var _option_data = eval('wish_option_json_data' + idx);
                    var _option_type = eval('wish_option_type' + idx);
                    var _option_display_type = eval('wish_option_display_type' + idx);
                    var _wish_id = eval('wish_id' + idx);

                    _options.push('<input type="hidden" name="add_product[' + key_no + '][uid]" value="' + _wish_uid + '" class="MS_wish_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + key_no + '][brandcode]" value="' + _wish_brandcode + '" class="MS_wish_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option_type]" value="' + _option_type + '" class="MS_wish_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + key_no + '][amount]" value="' + _wish_amount + '" class="MS_wish_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + key_no + '][wish_id]" value="' + _wish_id + '" class="MS_wish_option_values" />');

                    // NO �ɼ��� ��� ������ ���� ���� ����
                    if (_option_type == 'NO' || ($.inArray(_option_data, Array(undefined, null)) === -1 && object_count(_option_data.basic) == 1 && _option_data.basic[0][0].opt_value === undefined)) {
                        _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][0][opt_id]" value="0" class="MS_wish_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][0][opt_value]" value="" class="MS_wish_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][0][opt_stock]" value="' + _wish_amount + '" class="MS_wish_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][0][sto_id]" value="' + _option_data.basic[0][0].sto_id + '" class="MS_wish_option_values" />');
                    } else {
                        var _dummy = [];
                        var _select = [];
                        $.each($('[name="optionlist' + idx + '[]"]'), function(_i, _d) {
                            // ���տɼǰ� ������ ������ �����͸� �����ϱ� ���� �ӽ� ������ ��� �д�
                            if (_option_data.basic[_i][0].opt_mix == 'Y') {
                                var _t = {};
                                _t.stock_key = _i; // ���� �������� Ű���� ��� ��
                                _t.opt_stock = _wish_amount.numeric();
                                _t.opt_id = $(this).attr('opt_id');
                                _t.opt_value = $(this).children('option:selected').attr('title');
                                _dummy.push(_t);
                            } else {
                                _select.push($(this));
                            }
                        });

                        var _opt_num = 0;
                        $.each(_select, function(_i, _d) {
                            var _opt_id = $(_d).attr('opt_id') || 0;
                            if ($(_d).get(0).tagName.toLowerCase() == 'input') {
                                var _opt_value = ($(_d).attr('title') == $(_d).val()) ? '' : $(_d).val();
                            } else {
                                var _opt_value = $(_d).children('option:selected').attr('title') || '';
                            }
                            var _sto_id = $(_d).children('option:selected').attr('sto_id') || 0;

                            _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_id]" value="' + _opt_id + '" class="MS_wish_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_value]" value="' + _opt_value + '" class="MS_wish_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_stock]" value="' + _wish_amount + '" class="MS_wish_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][sto_id]" value="' + _sto_id + '" class="MS_wish_option_values" />');
                            _opt_num++;
                        });

                        if (_dummy.length > 0) {
                            var _data = {};
                            var _opt_ids = [];
                            var _opt_values = [];
                            var _amount = 0;
                            $.each(_dummy, function(_i, _d) {
                                _data = _option_data.basic[_d.stock_key];
                                _opt_ids.push(_d.opt_id);
                                _opt_values.push(_d.opt_value);
                                _amount = _d.opt_stock;
                            });

                            $.each(_data, function(_i, _d) {
                                if (_d.opt_ids == _opt_ids.join(',') && _d.opt_values == _opt_values.join(',')) {
                                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_id]" value="' + _d.opt_ids + '" class="MS_wish_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_value]" value="' + _d.opt_values + '" class="MS_wish_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][opt_stock]" value="' + _amount + '" class="MS_wish_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + key_no + '][option][basic][0][' + _opt_num + '][sto_id]" value="' + _d.sto_id + '" class="MS_wish_option_values" />');
                                }
                            });
                        }
                    }
                }
            });

            // �߰��� �ɼ��� ���� ��� ����
            $('input.MS_wish_option_values').remove();
            // ������ �ɼ� input ������ append��
            $('form[name="' + form_name + '"]').append(_options.join('\n'));
        }
    };

    // �ɼ� �� ����
    window.option_value_replace = function(_uid) {
        // �⺻ �ɼ��� ��� �ֻ��� �ɼ��� ������ ���� �ɼ��� ���� ����д�.
        // ���������� �ɼ��� �����ϸ� ���� �ɼ��� append ��
        var _uid = _uid || ''; // ��Ű���� �Բ� ����ϱ� ����
        var _option_list = $('[name="optionlist' + _uid + '[]"].basic_option');
        var _mix_option_num = 1;
        var _mix_option_count = _option_list.filter('[opt_mix="Y"]').length;
        var _opt_ids = '';
        var _opt_values = '';
        var _cart_opt_ids = '';
        var _cart_opt_values = '';
        $.each(_option_list, function(key, data) {
            // '���þ���' �ɼ� ������
            if ($(this).is('select') === false) {                   // ��Ŭ�� �ɼ�

                if (option_manager.info.option_display_type == 'EVERY' && $(this).attr('opt_mix') == 'Y' && _mix_option_count > 1 && _mix_option_num < _mix_option_count) {
                    if (typeof cart_option_json != 'undefined' || key == 0) {
                        if (typeof cart_option_json != 'undefined') {
                            $.each(cart_option_json.basic, function(_idx, _data) {
                                _cart_opt_ids = _cart_opt_ids + cart_option_json.basic[_idx][key].opt_id + ',';
                                _cart_opt_values = _cart_opt_values + cart_option_json.basic[_idx][key].opt_value + ',';
                            });
                        }
                    }
                }

                var _idx = $(this).attr('opt_key');
                var _ul = $('.MK-oneclick-list[opt_key='+_idx+']');
                var _op = $(this);

                // ���� �ɼ� ��� disable
                if (key > 0 && _op.attr('opt_mix') == 'Y') {
                    _ul.find('.MK-oneclick-li').addClass('MK-oneclick-dis');
                }

                // ������� �ɼ� ����
                if (_op.attr('opt_mix') == 'Y' && _mix_option_count > 1) {
                    var _opt_ids = '';
                    var _opt_values = '';

                    $.each(_ul.find('.MK-oneclick-link'), function(_i, _d) {
                        _opt_ids = _op.attr('opt_id');
                        _opt_values = $(this).attr('title');
                        if (_op.attr('opt_mix') == 'Y' && option_manager.check_show_option(_opt_ids, _opt_values) === false) {
                            $(this).parents('.MK-oneclick-li').hide();
                        }
                    });
                }
                if ($(this).attr('opt_mix') == 'Y' && _mix_option_count == 1) {
                    if (typeof cart_option_json != 'undefined' && option_manager.info.option_display_type == 'EVERY') {
                        var _tmp_cart_data = new Array();
                        $.each(option_manager.info.json.basic[key], function(_search_key, _search_data) {
                            if (_cart_opt_ids == _search_data.opt_ids.substring(0, _cart_opt_ids.length) && $.trim(_cart_opt_values) == $.trim(_search_data.opt_values).substring(0, $.trim(_cart_opt_values).length)) {
                                _tmp_cart_data.push(_search_data);
                            }
                        });
                    }
                    $.each(_ul.find('.MK-oneclick-link'), function(_i, _d) {
                        try {
                            var _opt = $(this);
                            var _add_text = '';
                            var _add_price = '';
                            var _text = _opt.attr('opt_val');
                            var _data = option_manager.info.json.basic[key][_i];
                            if (typeof cart_option_json != 'undefined' && option_manager.info.option_display_type == 'EVERY') {
                                var _tmp_use = false;
                                var _tmp_idx = null;
                                $.each(_tmp_cart_data, function(_tmp_key, _tmp_data) {
                                    if (_cart_opt_values + _text == _tmp_data.opt_values) {
                                        _tmp_idx = _tmp_key;
                                        _tmp_use = true;
                                    }
                                });
                                if (_tmp_use === false) {
                                    _opt.remove();
                                    _data = null;
                                } else {
                                    _data = _tmp_cart_data[_tmp_idx];
                                }
                            }

                            if (_data !== null) {
                                // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                                if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === 'false') {
                                    _add_price = '';
                                } else {
                                    // �и����� ��� �߰��ݾ��� �߰�����
                                    if (option_manager.info.option_display_type == 'EVERY') {
                                        if (_data.sto_price > 0) {
                                            _add_price = '(+' + (Math.abs(parseInt(_data.sto_price, 10))).number_format() + ')';
                                            _opt.attr('price', parseInt(_opt.attr('price'), 10) + Math.abs(parseInt(_data.sto_price, 10)));
                                        } else if (_data.sto_price < 0) {
                                            _add_price = '(-' + (Math.abs(parseInt(_data.sto_price, 10))).number_format() + ')';
                                            _opt.attr('price', parseInt(_opt.attr('price'), 10) - Math.abs(parseInt(_data.sto_price, 10)));
                                        }
                                        // �ǸŰ� ���������� ��� (discount_percent)
                                        _opt.attr('org_opt_price', Math.abs(parseInt(_data.org_opt_price, 10)));
                                    }
                                }
                            }

                            switch (_data.sto_state) {
                                case 'HIDE': $(this).parents('.MK-oneclick-li').hide(); break;
                                case 'SOLDOUT': 
                                    _add_text = ' - ' + get_lang('soldout_txt'); 
                                    $(this).parents('.MK-oneclick-li').addClass('MK-oneclick-dis');
                                    break;
                                case 'TEMPOUT': 
                                    _add_text = ' - ' + get_lang('tempsoldout_txt'); 
                                    $(this).parents('.MK-oneclick-li').addClass('MK-oneclick-dis');
                                    break;
                                case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                                case 'SALE':
                                    var _is_unlimit = _data.sto_unlimit == 'Y' ? true : false;
                                    if (_is_unlimit === true) {
                                        _add_text = '';
                                    } else if (_data.sto_stop_use == 'Y' && (_data.sto_real_stock - _data.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                        _add_text = ' - ' + get_lang('soldout_txt');
                                    }

                                    if (option_stock_display != 'NO' && _add_text.length == 0) {
                                        if (_data.sto_stop_use == 'Y') {
                                            _add_text = ' - (' + get_lang('stock_title') + ' : ' + Math.max(0, _data.sto_real_stock - _data.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                        } else {
                                            _is_unlimit = true;
                                        }
                                        if (_is_unlimit === true) {
                                            if (option_stock_display == 'DISPLAY') {
                                                _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                            }
                                            if (option_stock_display == 'LIMIT') {
                                                _add_text = '';
                                            }
                                        }
                                    }
                                    break;
                            }
                            if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && _data.sto_note.length > 0) {
                                _add_text += '(' + _data.sto_note.substr(0, 20) + ')';
                            }
                            _opt.attr('title', _text + _add_price + _add_text);
                        } catch (e) {
                            return true;
                        }
                    });
                }
                
            } else {
                // package �� ��� �ɼ� �������� ����
                if($('#product_type').val() != "PACKAGE") {
                    if ($(this).attr('opt_mix') == 'Y') {
                        $(this).children('option[title="' + get_lang('non_option_txt') + '"][value=0]').remove();
                    }
                }
                if (option_manager.info.option_display_type == 'EVERY' && $(this).attr('opt_mix') == 'Y' && _mix_option_count > 1 && _mix_option_num < _mix_option_count) {
                    if (typeof cart_option_json != 'undefined' || key == 0) {

                        $.each($(this).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")'), function(_i, _d) {
                            _opt_ids = key === 0 ? $(this).parents('select:first').attr('opt_id') : _cart_opt_ids + $(this).parents('select:first').attr('opt_id');
                            _opt_values = key === 0 ? $(this).attr('title') : _cart_opt_values + $(this).attr('title');
                            if ($(this).parents('select:first').attr('opt_mix') == 'Y' && option_manager.use_child_option(key, _opt_ids, _opt_values) === false) {
                                $(this).remove();
                            }
                        });

                        if (typeof cart_option_json != 'undefined') {
                            $.each(cart_option_json.basic, function(_idx, _data) {
                                _cart_opt_ids = _cart_opt_ids + cart_option_json.basic[_idx][key].opt_id + ',';
                                _cart_opt_values = _cart_opt_values + cart_option_json.basic[_idx][key].opt_value + ',';
                            });
                        }
                    }
                }
                // �ɼǵ��� ������ ù��°, ���þ��� �ɼ��� ����
                if ($(this).attr('opt_mix') == 'Y' && _mix_option_count == _mix_option_num) {
                    if (typeof cart_option_json != 'undefined' && option_manager.info.option_display_type == 'EVERY') {
                        var _tmp_cart_data = new Array();
                        $.each(option_manager.info.json.basic[key], function(_search_key, _search_data) {
                            if (_cart_opt_ids == _search_data.opt_ids.substring(0, _cart_opt_ids.length) && $.trim(_cart_opt_values) == $.trim(_search_data.opt_values).substring(0, $.trim(_cart_opt_values).length)) {
                                _tmp_cart_data.push(_search_data);
                            }
                        });
                    }
                    $.each($(this).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")'), function(_i, _d) {
                        if ($(this).text() != get_lang('non_option_txt')) { // �ѹ��� �˻�
                            try {
                                var _opt = $(this);
                                var _add_text = '';
                                var _add_price = '';
                                var _text = _opt.text();
                                var _data = option_manager.info.json.basic[key][_i];
                                if (typeof cart_option_json != 'undefined' && option_manager.info.option_display_type == 'EVERY') {
                                    var _tmp_use = false;
                                    var _tmp_idx = null;
                                    $.each(_tmp_cart_data, function(_tmp_key, _tmp_data) {
                                        if (_cart_opt_values + _text == _tmp_data.opt_values) {
                                            _tmp_idx = _tmp_key;
                                            _tmp_use = true;
                                        }
                                    });
                                    if (_tmp_use === false) {
                                        _opt.remove();
                                        _data = null;
                                    } else {
                                        _data = _tmp_cart_data[_tmp_idx];
                                    }
                                }

                                if (_data !== null) {
                                    // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                                    if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === 'false') {
                                        _add_price = '';
                                    } else {
                                        // �и����� ��� �߰��ݾ��� �߰�����
                                        if (option_manager.info.option_display_type == 'EVERY') {
                                            if (_data.sto_price > 0) {
                                                _add_price = '(+' + (Math.abs(parseInt(_data.sto_price, 10))).number_format() + ')';
                                                _opt.attr('price', parseInt(_opt.attr('price'), 10) + Math.abs(parseInt(_data.sto_price, 10)));
                                            } else if (_data.sto_price < 0) {
                                                _add_price = '(-' + (Math.abs(parseInt(_data.sto_price, 10))).number_format() + ')';
                                                _opt.attr('price', parseInt(_opt.attr('price'), 10) - Math.abs(parseInt(_data.sto_price, 10)));
                                            }

                                            // �ǸŰ� ���������� ��� (discount_percent)
                                            _opt.attr('org_opt_price', Math.abs(parseInt(_data.org_opt_price, 10)));
                                        }
                                    }

                                    switch (_data.sto_state) {
                                        case 'HIDE': _opt.remove(); break;
                                        case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                                        case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                                        case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                                        case 'SALE':
                                            var _is_unlimit = _data.sto_unlimit == 'Y' ? true : false;
                                            if (_is_unlimit === true) {
                                                _add_text = '';
                                            } else if (_data.sto_stop_use == 'Y' && (_data.sto_real_stock - _data.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                                _add_text = ' - ' + get_lang('soldout_txt');
                                            }

                                            if (option_stock_display != 'NO' && _add_text.length == 0) {
                                                if (_data.sto_stop_use == 'Y') {
                                                    _add_text = ' - (' + get_lang('stock_title') + ' : ' + Math.max(0, _data.sto_real_stock - _data.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                                } else {
                                                    /*
                                                    if (_data.sto_real_stock < 0) {
                                                        _is_unlimit = true;
                                                    } else {
                                                        _add_text = ' - (' + get_lang('stock_title') + ' : ' + _data.sto_real_stock + ' ' + get_lang('stock_unit') + ')';
                                                    }
                                                    */
                                                    _is_unlimit = true;
                                                }
                                                if (_is_unlimit === true) {
                                                    if (option_stock_display == 'DISPLAY') {
                                                        _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                                    }
                                                    if (option_stock_display == 'LIMIT') {
                                                        _add_text = '';
                                                    }
                                                }
                                            }
                                            break;
                                    }
                                    if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && _data.sto_note.length > 0) {
                                        _add_text += '(' + _data.sto_note.substr(0, 20) + ')';
                                    }
                                    _opt.text(_text + _add_price + _add_text);
                                }
                            } catch (e) {
                                return true;
                            }
                        }
                    });
                }
            }
            _mix_option_num++;
        });

        // ���� �ɼ��� ���� ���� ���� �ؽ�Ʈ�� ��� ����
        $.each($('[name="optionlist[]"].addition_option'), function(key, data) {
            // �ɼǵ��� ������ ù��°, ���þ��� �ɼ��� ����
            $.each($(this).children('option').not(':first'), function(_i, _d) {
                try {
                    var _add_text = '';
                    var _text = $(this).text();

                    switch (option_manager.info.json.addition[key][_i].sto_state) {
                        case 'HIDE': $(this).remove(); break;
                        case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                        case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                        case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                        case 'SALE':
                            var _t = option_manager.info.json.addition[key][_i];
                            var _is_unlimit = _t.sto_unlimit == 'Y' ? true : false;
                            if (_is_unlimit === true) {
                                _add_text = '';
                            } else if ((_t.sto_real_stock - _t.sto_stop_stock) <= 0 && _add_text.length == 0) {
                            // addition�� stop_use ���� ����. 0 �� ǰ���̴�.
                                _add_text = ' - ' + get_lang('soldout_txt');
                            }

                            if (option_stock_display != 'NO' && _add_text.length == 0) {
                                if (_is_unlimit === true) {
                                    if (option_stock_display == 'DISPLAY') {
                                        _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                    }
                                    if (option_stock_display == 'LIMIT') {
                                        _add_text = '';
                                    }
                                } else {
                                    _add_text = ' - (' + get_lang('stock_title') + ' : ' + Math.max(0, _t.sto_real_stock - _t.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                }
                            }
                            break;
                    }
                    $(this).text(_text + _add_text);
                } catch (e) {
                    return true;
                }
            });
        });
    };


    // ���� ��ǰ �ɼǰ� �����
    window.related_option_value_replace = function (related_key) {

        // �߰� ����, ��� ���� ����
        var get_opt_text = function (opt, stock) {
            var _text = $(opt).attr('title');
            var _add_price = '';
            var _add_text = '';

            // ��� �κ�
            if (Object.keys(stock).length > 0) {
                $.each(stock.data, function () {
                    if (this.opt_values == stock.opt_values) {
                        // ���� �κ�
                        if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                            _add_price = '';
                        } else {
                            if (this.sto_price > 0) {
                                _add_price = '(+' + (Math.abs(parseInt(this.sto_price, 10))).number_format() + ')';
                            } else if (this.sto_price < 0) {
                                _add_price = '(-' + (Math.abs(parseInt(this.sto_price, 10))).number_format() + ')';
                            }
                        }
                        $(opt).show()
                        switch (this.sto_state) {
                            case 'HIDE': $(opt).remove(); break;
                            case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                            case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                            case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                            case 'SALE':
                                var _is_unlimit = this.sto_unlimit == 'Y' ? true : false;
                                if (_is_unlimit === true) {
                                    _add_text = '';
                                } else if (this.sto_stop_use == 'Y' && (this.sto_real_stock - this.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                    _add_text = ' - ' + get_lang('soldout_txt');
                                }
                                if (option_stock_display != 'NO' && _add_text.length == 0) {
                                    if (this.sto_stop_use == 'Y') {
                                        _add_text = ' (' + get_lang('stock_title') + ' : ' +  Math.max(0, this.sto_real_stock - this.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                    } else {
                                        /*
                                        if (this.sto_real_stock < 0) {
                                            _is_unlimit = true;
                                        } else {
                                            _add_text = ' (' + get_lang('stock_title') + ' : ' +  this.sto_real_stock + ' ' + get_lang('stock_unit') + ')';
                                        }
                                        */
                                        _is_unlimit = true;
                                    }
                                }
                                if (_is_unlimit === true) {
                                    if (option_stock_display == 'DISPLAY') {
                                        _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                    }
                                    if (option_stock_display == 'LIMIT') {
                                        _add_text = '';
                                    }
                                }
                                break;
                        }

                        if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && this.sto_note.length > 0) {
                            _add_text += '(' + this.sto_note.substr(0, 20) + ')';
                        }
                    }
                });
            }
            _text += _add_price + _add_text;
            return _text;
        };


        return function () {
            var _option_list = $('select[name="optionlist' + related_key + '[]"]');
            var _json_data = window['related_option_json_data' + related_key];

            if (_option_list.length > 0) {
                if (window['related_option_display_type' + related_key] == 'EACH') {            // ��ü��
                    var _idx = $('select[name="optionlist' + related_key + '[]"]').index(_option_list.filter('[opt_mix="Y"]'));
                    var _option_stock_data = _json_data.basic[_idx];
                    $.each($('option[value!=""]', _option_list.filter('[opt_mix="Y"]')), function (_i, _o) {
                        $(this).text(get_opt_text(this, { data: _option_stock_data, opt_values: $(this).attr('title') }));
                    });

                } else {
                    // 1. ����� ã�� ���� opt_ids�� ��������.
                    var _opt_values = [];
                    var _idx = [];

                    // ������ �ɼ� �ٷ� �������� �̴´�
                    $.each(_option_list.filter('[opt_mix="Y"]'), function (_i, _o) {
                        if (_i < (_option_list.filter('[opt_mix="Y"]').length - 1)) {
                            _idx.push(_option_list.index(this));
                        }
                    });

                    $.each($(_idx), function (_i, _o_idx) {
                        if ($(_option_list[_o_idx]).val().length > 0) {
                            _opt_values.push($('option:selected', _option_list[_o_idx]).attr('title'));
                        }
                    });

                    // ������� �ɼ� ó�� ���� �ɼ� �⺻�� ���� ����
                    if (!related_option_mix_list[related_key]) {
                        related_option_mix_list[related_key] = $(_option_list.filter('[opt_mix="Y"]:last')).html();
                    } else {
                        var sel_val = _option_list.filter('[opt_mix="Y"]:last').val();
                        $(_option_list.filter('[opt_mix="Y"]:last')).html(related_option_mix_list[related_key])
                        $(_option_list.filter('[opt_mix="Y"]:last')).val(sel_val);
                    }

                    var _option_stock_data = _json_data.basic[_option_list.index(_option_list.filter('[opt_mix="Y"]:last'))];

                    $.each($(_option_list.filter('[opt_mix="Y"]:last').children('option').not(':first')), function () {
                        var _v = '';
                        if (_option_list.filter('[opt_mix="Y"]').length > 1) {
                            _v = _opt_values.join(',') + ',';
                        }
                        _v += $(this).attr('title');
                        if (_option_list.filter('[opt_mix="Y"]').length == 1 || _opt_values.length > 0) {
                            $(this).text(get_opt_text(this, { data: _option_stock_data, opt_values: _v }));
                        } else {
                            $(this).text(get_opt_text(this, {  }));
                        }
                    });
                }
            }
        }();
    };

    // ���� ��ǰ �ɼǰ� �����
    window.wish_option_value_replace = function (wish_key) {

        // �߰� ����, ��� ���� ����
        var get_opt_text = function (opt, stock) {
            var _text = $(opt).attr('title');
            var _add_price = '';
            var _add_text = '';

            // ��� �κ�
            if (Object.keys(stock).length > 0) {
                $.each(stock.data, function () {
                    if (this.opt_values == stock.opt_values) {
                        // ���� �κ�
                        if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                            _add_price = '';
                        } else {
                            if (this.sto_price > 0) {
                                _add_price = '(+' + (Math.abs(parseInt(this.sto_price, 10))).number_format() + ')';
                            } else if (this.sto_price < 0) {
                                _add_price = '(-' + (Math.abs(parseInt(this.sto_price, 10))).number_format() + ')';
                            }
                        }
                        $(opt).show()
                        switch (this.sto_state) {
                            case 'HIDE': $(opt).remove(); break;
                            case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                            case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                            case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                            case 'SALE':
                                var _is_unlimit = this.sto_unlimit == 'Y' ? true : false;
                                if (_is_unlimit === true) {
                                    _add_text = '';
                                } else if (this.sto_stop_use == 'Y' && (this.sto_real_stock - this.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                    _add_text = ' - ' + get_lang('soldout_txt');
                                }
                                if (option_stock_display != 'NO' && _add_text.length == 0) {
                                    if (this.sto_stop_use == 'Y') {
                                        _add_text = ' (' + get_lang('stock_title') + ' : ' +  Math.max(0, this.sto_real_stock - this.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                    } else {
                                        /*
                                        if (this.sto_real_stock < 0) {
                                            _is_unlimit = true;
                                        } else {
                                            _add_text = ' (' + get_lang('stock_title') + ' : ' +  this.sto_real_stock + ' ' + get_lang('stock_unit') + ')';
                                        }
                                        */
                                        _is_unlimit = true;
                                    }
                                }
                                if (_is_unlimit === true) {
                                    if (option_stock_display == 'DISPLAY') {
                                        _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                    }
                                    if (option_stock_display == 'LIMIT') {
                                        _add_text = '';
                                    }
                                }
                                break;
                        }

                        if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && this.sto_note.length > 0) {
                            _add_text += '(' + this.sto_note.substr(0, 20) + ')';
                        }
                    }
                });
            }
            _text += _add_price + _add_text;
            return _text;
        };


        return function () {
            var _option_list = $('select[name="optionlist' + wish_key + '[]"]');
            var _json_data = window['wish_option_json_data' + wish_key];

            if (_option_list.length > 0) {
                if (window['wish_option_display_type' + wish_key] == 'EACH') {            // ��ü��
                    var _idx = $('select[name="optionlist' + wish_key + '[]"]').index(_option_list.filter('[opt_mix="Y"]'));
                    var _option_stock_data = _json_data.basic[_idx];
                    $.each($('option[value!=""]', _option_list.filter('[opt_mix="Y"]')), function (_i, _o) {
                        $(this).text(get_opt_text(this, { data: _option_stock_data, opt_values: $(this).attr('title') }));
                    });

                } else {
                    // 1. ����� ã�� ���� opt_ids�� ��������.
                    var _opt_values = [];
                    var _idx = [];

                    // ������ �ɼ� �ٷ� �������� �̴´�
                    $.each(_option_list.filter('[opt_mix="Y"]'), function (_i, _o) {
                        if (_i < (_option_list.filter('[opt_mix="Y"]').length - 1)) {
                            _idx.push(_option_list.index(this));
                        }
                    });

                    $.each($(_idx), function (_i, _o_idx) {
                        if ($(_option_list[_o_idx]).val().length > 0) {
                            _opt_values.push($('option:selected', _option_list[_o_idx]).attr('title'));
                        }
                    });

                    // ������� �ɼ� ó�� ���� �ɼ� �⺻�� ���� ����
                    if (!wish_option_mix_list[wish_key]) {
                        wish_option_mix_list[wish_key] = $(_option_list.filter('[opt_mix="Y"]:last')).html();
                    } else {
                        var sel_val = _option_list.filter('[opt_mix="Y"]:last').val();
                        $(_option_list.filter('[opt_mix="Y"]:last')).html(wish_option_mix_list[wish_key])
                        $(_option_list.filter('[opt_mix="Y"]:last')).val(sel_val);
                    }

                    var _option_stock_data = _json_data.basic[_option_list.index(_option_list.filter('[opt_mix="Y"]:last'))];

                    $.each($(_option_list.filter('[opt_mix="Y"]:last').children('option').not(':first')), function () {
                        var _v = '';
                        if (_option_list.filter('[opt_mix="Y"]').length > 1) {
                            _v = _opt_values.join(',') + ',';
                        }
                        _v += $(this).attr('title');
                        if (_option_list.filter('[opt_mix="Y"]').length == 1 || _opt_values.length > 0) {
                            $(this).text(get_opt_text(this, { data: _option_stock_data, opt_values: _v }));
                        } else {
                            $(this).text(get_opt_text(this, {  }));
                        }
                    });
                }
            }
        }();
    };

    $(function() {
        // �ɼ� �� ����
        option_value_replace();

        // ���� �Ǿ� �������� ������
        if (typeof cart_option_json != 'undefined') {
            // ������ �⺻ �ɼ� ���� ���·� ���
            var _basic_key = 0;
            var _basic_data = [];
            $.each(cart_option_json.basic, function(_idx, _data) {
                var _opt_mix_count = 0;
                $.each(_data, function(_i, _d) {
                    if (option_display_type == 'EVERY') {
                        var _opt_idx = $.inArray(_d.opt_value, optionJsonData.basic[_i][0].opt_value.split(','));
                        var _opt_price = 0;
                        if (optionJsonData.basic[_i][0].opt_mix == 'Y') {
                            if (_opt_mix_count == 0) {
                                $.each(optionJsonData.basic[_i], function(key, val) {
                                    if (_d.sto_id == val.sto_id) {
                                        _opt_price = val.sto_price || 0;
                                        _opt_mix_count++;
                                        return false;
                                    }
                                });
                            }
                        } else {
                            _opt_price = optionJsonData.basic[_i][0].opt_price.split(',')[_opt_idx] || 0;
                        }
                        var _opt_type = optionJsonData.basic[_i][0].opt_type;
                    } else {
                        if (optionJsonData.basic[_i][0].opt_values === undefined) {
                            var _opt_idx = $.inArray(_d.opt_value, optionJsonData.basic[_i][0].opt_value.split(','));
                            var _opt_price = optionJsonData.basic[_i][0].opt_price.split(',')[_opt_idx] || 0;
                        } else {
                            var _opt_price = 0;
                            $.each(optionJsonData.basic[_i], function(_k, _v) {
                                if (_d.opt_id == _v.opt_ids && _d.opt_value == _v.opt_values) {
                                    _opt_price = _v.sto_price;
                                    return false;
                                }
                            });
                        }
                        var _opt_type = optionJsonData.basic[_i][0].opt_type;
                    }
                    var _tmp_sto_id = option_display_type == 'EVERY' ? '0' :_d.sto_id;
                    _basic_data.push({
                        opt_id: _d.opt_id,
                        opt_type: _opt_type,
                        opt_value: _d.opt_value,
                        opt_stock: _d.opt_stock,
                        opt_price: _opt_price,
                        sto_id: _tmp_sto_id
                    });
                });
                option_manager.data.basic[0] = _basic_data;
                $('#MS_amount_basic_' + _basic_key).val(option_manager.data.basic[0][0].opt_stock);

                $.each($('[name="optionlist[]"].basic_option'), function(_i, _d) {
                    if (option_manager.data.basic[0][_i] === undefined) {return true;}
                    if (option_manager.data.basic[0][_i].opt_type == 'CUSTOM') {
                        $(this).val(option_manager.data.basic[0][_i].opt_value);
                    } else {
                        if ($(this).attr('opt_oneclick') && $(this).attr('opt_oneclick') == 'Y') {
                            var _ul = $('.MK-oneclick-list[opt_key='+$(this).attr('opt_key')+']');
                            var _text = $('.MK-oneclick-value[opt_key='+$(this).attr('opt_key')+']');
                            $.each(_ul.children('.MK-oneclick-li'), function(k, v) {
                                var _value = $(this).children('.MK-oneclick-link').attr('opt_val');
                                if (option_manager.data.basic[0][_i].opt_value == _value) {
                                    $(this).addClass('MK-oneclick-sel').removeClass('MK-oneclick-dis').siblings('.MK-oneclick-li').removeClass('MK-oneclick-sel').removeClass('MK-oneclick-dis');
                                    _text.html($(this).children('.MK-oneclick-link').attr('title'));
                                    return false;
                                }
                            });
                        } else {
                            $.each($(this).children('option'), function(k, v) {
                                if (option_manager.data.basic[0][_i].opt_value == $(this).attr('title')) {
                                    $(this).attr('selected', true);
                                    return false;
                                }
                            });
                        }
                    }
                });
                _basic_key++;
            });

            // ������ ���� �ɼ� ���� ���·� ���
            var _addition_key = 0;
            $.each(cart_option_json.addition, function(_idx, _data) {
                var _addition_data = [];
                $.each(_data, function(_i, _d) {
                    var _opt_price = 0;

                    $.each(optionJsonData.addition, function(_oidx, _odata) {
                        $.each(optionJsonData.addition[_oidx], function(_k, _v) {
                            if (_d.opt_id == _v.opt_ids && _d.opt_value == _v.opt_values) {
                                _opt_price = _v.sto_price;
                                return false;
                            }
                        });
                    });
                    _addition_data.push({
                        opt_id: _d.opt_id,
                        opt_type: 'ADDITION',
                        opt_value: _d.opt_value,
                        opt_stock: _d.opt_stock,
                        opt_price: _opt_price,
                        sto_id: _d.sto_id
                    });
                });
                option_manager.data.addition.push(_addition_data);
                $('#MS_amount_addition_' + _addition_key).val(option_manager.data.addition[_addition_key][0].opt_stock);
                $.each($('[name="optionlist[]"].addition_option').eq(_addition_key).children('option'), function(k, v) {
                    if (_addition_data[0].opt_value == $(this).attr('title')) {
                        $(this).attr('selected', true);
                        return false;
                    }
                })
                _addition_key++;
            });
        }

        // option_type == 'NO' �� ��� �⺻ �ɼ� ���� �߰���
        if (option_type == 'NO' || ($.inArray(option_manager.info.json, Array(undefined, null)) === -1 && object_count(option_manager.info.json.basic) == 1 && option_manager.info.json.basic[0][0].opt_value === undefined)) {
            var _cart_cnt = option_manager.get_cart_amount();
            if (_cart_cnt > 1) {
                var opt_mng_amount = _cart_cnt;
            } else {
                var opt_mng_amount = option_manager.get_min_amount('basic');
            }
            option_manager.data.basic[0].push({
                opt_id: option_manager.info.json.basic[0][0].opt_ids || '0',
                opt_value: product_name,
                opt_stock: opt_mng_amount,
                opt_price: 0,
                sto_id: option_manager.info.json.basic[0][0].sto_id || '0'
            });
            option_manager.info.json.basic[0][0].opt_value = product_name;
        }

        // ���� ��ǰ �� ���� ���
        option_manager.sum_total_price();
    });
})(jQuery);

// input box focus in action
function option_focus(obj) {
    option_manager.input_focus(obj);
    return false;
}

// option change action
function change_option(obj, option_mode, target) {
    option_manager.change_option(obj, option_mode, target);
    return false;
}

// option click action
function oneclick_click_option(obj, option_mode, target, dimg) {
    if (typeof oneclick_change_mimg != 'undefined') {
        oneclick_change_mimg(dimg);
    }
    option_manager.click_option(obj, option_mode, target);
    return false;
}


// option change action
function sum_total_price() {
    option_manager.sum_total_price();
    return false;
}

// amount input box change action
function set_amount(obj, option_mode, mode) {
    option_manager.set_amount(obj, option_mode, mode);
}

// create option value input hidden box
function create_option_input(form_name, relation, mode, product_type) {
    if (relation != 'relation_only') {
        if (option_manager.print_option(form_name, mode) === false) {
            return false;
        }
    }
    // ���� ��ǰ�� �Բ� ��ٱ��� ��� ��� ����
    if (relation == 'relation' || relation == 'relation_only') {
        if (related_product_manager.print_option(form_name) === false) {
            return false;
        }
    }
}

// ���̺긮�� �ɼ� ����
function hybrid_option_add(obj) {
    var _this = this;
    var _info = option_manager.info;
    var _json = option_manager.info.json.basic;
    var option_mode = 'basic';

    if (typeof shop_language == 'undefined') {
        var shop_language = 'kor';
    }
    if (option_manager.info.view_member_only_price == 'Y' && IS_LOGIN === 'false') {
        alert(((shop_language == 'eng') ? 'Member login required to buy.' : 'ȸ�� �α����� �Ͻø� �����Ͻ� �� �ֽ��ϴ�.'));    
        return;
    }

    // ���� ���õ� �ɼ��� Ÿ���� ������
    _info.type = $(obj).get(0).tagName.toLowerCase();

    // �ɼ� ���� ������� ó��
    if ($(obj).val().replace(/[\s]/g, '').length == 0) {
        return false;
    }
    var _option = new StringBuffer();
    var opt_id = $(obj).attr('opt_id');
    var opt_value = $(obj).attr('value');
    var opt_title = $(obj).attr('opt_title');
    var opt_name = $(obj).attr('opt_name');
    var amount_min = $(obj).attr('amount_min').split(",");
    var amount_max = $(obj).attr('amount_max').split(",");
    var sto_state = $(obj).attr('sto_state');
    var sto_unlimit = $(obj).attr('sto_unlimit');
    var sto_real_stock = $(obj).attr('sto_real_stock');
    var key = $(obj).attr('sto_key');
    var group_opt_cnt = 0;
    var opt_input_type = true;
    var opt_total_cnt = 0;
    var product_preview = false;
    var amount_min_cnt = (amount_min[2] == '') ? 1 : amount_min[2];
    if (MOBILE_USE == '') {
        var stock = $('input[name=hy_qrt_' + opt_id + '_' + opt_value+']').val();
        // �ɼǺ� �����Է� �׸��� ������� ������ �⺻1�� üũ
        if (stock == undefined) {
            stock = 1;
            opt_input_type = false;
        }
        // �ɼǱ׷캰 ���õ� �� 
        $('input[name="hy_option[]"]').each(function(i) {
            if ($(this).is(':checked') === true) {
                var _chk_id = $(this).attr('id').replace("chk_","");
                var str_id = _chk_id.split("_");
                if ($('#hy_qrt_'+ _chk_id).val() != undefined && opt_id == str_id[0]) {
                    group_opt_cnt += $('#hy_qrt_'+ _chk_id).val().numeric();
                }
                opt_total_cnt += $('#hy_qrt_'+ _chk_id).val().numeric();
            }      
        });
        var opt_total_chk = group_opt_cnt;
    } else {
        key = key.replace("key_","");
        var prd_chk_info = this.product_chk_info(key);
        // �ɼǱ׷캰 ���õ� �� 
        $('input[name="amount[]"]').each(function(i) {
            if ($(this).is(':checked') === true) {
            var amount_min2 = $(this).attr('amount_min').split(",");
            var amount_min_cnt2 = (amount_min2[2] == '') ? 1 : amount_min2[2]; 
                opt_total_cnt += amount_min_cnt2.numeric();
            }        
        });
        opt_total_chk = group_opt_cnt + prd_chk_info[3].numeric();
        var stock = ($(obj).attr('cart_opt') > 1) ? $(obj).attr('cart_opt') : 1;
        // �ɼǺ� �����Է� �׸��� ������� ������ �⺻1�� üũ
        if (stock == undefined) {
            stock = 1;
            opt_input_type = false;
        }
    }
    var price = $(obj).attr('opt_price') * stock;
    var chk_cnt = 0;            // ���õ� �ɼ� ����
    key = key.replace("key_","");
    var prd_chk_info = this.product_chk_info(key);


    // üũ �����Ѱ�� ����Ⱥκ� ����
    if ($(obj).is(':checked') === false) {
        this.sum_total_price2(prd_chk_info[2]); 
        $('#MK_total').text(prd_chk_info[0]);
        $('#MS_opt_key_' + key).remove();
        $('#hb_img_' + key).siblings('span').removeClass('sel-img');
        if(prd_chk_info[0] == 0 && opt_input_type === true) {
            $('#MK_innerOpt_03').parent().parent().parent().hide();
        }
        return false;
    } else {
        if (amount_min_cnt > stock.numeric() || (amount_max[2] < stock.numeric() && amount_max[2] > 0)) {        // �ɼǺ� ���ż���üũ (�ּ�/�ִ�) ����üũ
            alert(get_lang('hybrid_option', opt_name, amount_max[2]));
            $('input[name=hy_qrt_' + opt_id + '_' + opt_value+']').val(amount_min_cnt);
            $('#MS_amount_' + opt_id + '_' + opt_value).val(amount_min_cnt);
            $(obj).attr("checked", false);
            return false;
        } else if (opt_total_chk > 0 && ((amount_min[1] > opt_total_chk && amount_min_cnt > opt_total_chk) || (amount_max[1] < opt_total_chk && amount_max[1] > 0))) {     // �ɼǱ׷캰 ���ż���üũ (�ּ�/�ִ�) ����üũ
            if (amount_min[1] == '') {
                alert(get_lang('hybrid_group_option2', opt_title, amount_max[1]));
            } else {
                alert(get_lang('hybrid_group_option', opt_title, amount_min[1], amount_max[1]));
            }
            $('input[name=hy_qrt_' + opt_id + '_' + opt_value+']').val(amount_min_cnt);
            $('#MS_amount_' + opt_id + '_' + opt_value).val(amount_min_cnt);
            $(obj).attr("checked", false);
            return false;
        } else if (opt_total_cnt > 0 && ((amount_min[0] > opt_total_cnt && amount_min_cnt > opt_total_cnt)|| (amount_max[0] < opt_total_cnt && amount_max[0] > 0))) {
            alert(get_lang('hybrid_product', opt_title, amount_min[0], amount_max[0]));
            $(obj).attr("checked", false);
            $('input[name=hy_qrt_' + opt_id + '_' + opt_value+']').val(amount_min_cnt);
            $('#MS_amount_' + opt_id + '_' + opt_value).val(amount_min_cnt);
            return false;
        }
        $('#hb_img_' + key).siblings('span').addClass('sel-img');
    }
    $('#MS_opt_key_' + key).hide();
    $('#MK_innerOpt_03').parent().parent().parent().show();
    _option.append('<li id="MS_opt_key_' + key +'">');
    _option.append('<input type="hidden" id="MS_keys_' + opt_value + '" value="' + key + '" class="basic_option" />');
    _option.append('<span class="MK_p-name">');
    _option.append(opt_title + ' : ');
    _option.append(opt_name+ '</span>');
    _option.append('<div class="MK_qty-ctrl">');
    _option.append('<input type="text" id="MS_amount_' + key + '" name="amount[]" value="' + stock + '" onfocusout="set_amount_input(this, \'' + key + '\', \''+ opt_value +'\');" opt_id="'+opt_id+'" opt_title="'+opt_title+'" opt_price="'+price+'" opt_name="'+opt_name+'" amount_min="'+amount_min+'" amount_max="'+amount_max+'" sto_state="'+sto_state+'" sto_unlimit="'+sto_unlimit+'" sto_real_stock="'+sto_real_stock+'" size="4" style="text-align: right; float: left;" class="basic_option" />');
    if (option_manager.info.is_mobile_use === true) {
        _option.append('&nbsp;<a href="javascript:set_amount_input(this, \'' + key + '\', \'up\');" class="btn-type-02 box-gradient-02 box-shadow-02"><span> +1</span>');
        _option.append('</a>');
        _option.append('&nbsp;<a href="javascript:set_amount_input(this, \'' + key + '\', \'down\');" class="btn-type-02 box-gradient-02 box-shadow-02"><span> -1</span>');
        _option.append('</a>');
    } else {
        _option.append('<a href="javascript:set_amount_input(this, \'' + key + '\', \'up\');" class="MK_btn-up">');
        _option.append('<img src="/images/common/basket_up.gif" alt="' + get_lang('increase_quantity') + '" border="0" />');
        _option.append('</a>');
        _option.append('<a href="javascript:set_amount_input(this, \'' + key + '\', \'down\');" class="MK_btn-dw">');
        _option.append('<img src="/images/common/basket_down.gif" alt="' + get_lang('decrease_quantity') + '" border="0" />');
        _option.append('</a>');
    }
    _option.append('</div>');
    if (price != 0) {
        _option.append('<strong class="MK_price"><span id="MK_p_price_' + key + '">' + price.number_format() + '</span>��</strong>');
    }
    _option.append('<a class="MK_btn-del" href="javascript:hybrid_option_delete(\'' + key + '\', '+ price + ',\'' +  amount_min[0] + '\');" id="MK_btn_del_' + this.option_idx + '">');
    if (option_manager.info.is_mobile_use === true) {
        _option.append('<img src="/m/skin/basic/images/icon/icon_option_remove.gif" alt="' + get_lang('remove') + '" border="0" />');
    } else {
        _option.append('<img src="/board/images/btn_comment_del.gif" alt="' + get_lang('remove') + '" border="0" />');
    }
    _option.append('</a>');
    _option.append('</li>');
    $('#MK_total').text(prd_chk_info[0]);
    $('#MK_innerOpt_03').append(_option.toString());
    $('#hybrid_op_price').val(prd_chk_info[2]);
    this.sum_total_price2(prd_chk_info[2]); 
}

// ���õ� ��ǰüũ
function product_chk_info(key) {
    var prd_cnt = 0;
    var group_cnt = 0;
    var price = 0;
    var min_cnt = 0;
    var return_array = new Array();
    $('input[name="hy_option[]"]').each(function() {
        if($(this).is(':checked') == true) {
            if (MOBILE_USE == '') {
                var mk_no = $(this).attr('sto_key').replace("key_",""); 
                if ($('#hy_qrt_' + mk_no).val() != undefined) {
                    prd_cnt += $('#hy_qrt_' + mk_no).val().numeric();
                } else {
                    if ($('#MS_amount_' + mk_no).val() != undefined) {
                        prd_cnt += $('#MS_amount_' + mk_no).val().numeric();
                    } else {
                        prd_cnt += 1;
                    }
                }
                
                if ($(this).attr('id').replace("chk_", "") == key) {
                    if ($('#hy_qrt_' + mk_no).val() != undefined) {
                        group_cnt += $('#hy_qrt_' + mk_no).val().numeric();
                        _chk = true;
                    } else {
                        if ($('#MS_amount_' + mk_no).val() != undefined) {
                            group_cnt += $('#MS_amount_' + mk_no).val().numeric();
                        } else {
                            group_cnt += 1;
                        }
                    }
                }
                if ($('#hy_qrt_' + mk_no).val() != undefined) {
                    price += $(this).attr('opt_price') * $('#hy_qrt_' + mk_no).val().numeric();
                } else {
                    if ($('#MS_amount_' + mk_no).val() != undefined) {
                        price += $('#MS_amount_' + mk_no).val() * $(this).attr('opt_price').numeric();
                    } else {
                        price += $(this).attr('opt_price').numeric();
                    }
                }
            } else {
                var mk_no = $(this).attr('sto_key').replace("key_",""); 
                var min_amount = $('#chk_' + mk_no).attr('amount_min').split(",");
                if ($('#MK_total').text() == 0) {
                    prd_cnt += min_amount[2].numeric();
                    group_cnt += min_amount[2].numeric();
                    price += $(this).attr('opt_price').numeric() * $('#MS_amount_' + mk_no).val();
                } else {
                    if ($('#MS_amount_' + mk_no).val() == undefined) {
                        prd_cnt += min_amount[2].numeric();
                        group_cnt += min_amount[2].numeric();
                        price += $(this).attr('opt_price').numeric();
                    } else {
                        prd_cnt += $('#MS_amount_' + mk_no).val().numeric();
                        group_cnt += $('#MS_amount_' + mk_no).val().numeric();
                        price += $(this).attr('opt_price') * $('#MS_amount_' + mk_no).val().numeric();
                    }
                }
            }
        } else {
            if (MOBILE_USE != '') {
                min_amount = $('#chk_'+key).attr('amount_min');
                if (min_amount != undefined && min_amount != '') {
                    min_amount = min_amount.split(",");
                    min_cnt = min_amount[2];
                }

            }
        }
    });
    return_array[0] = prd_cnt;
    return_array[1] = group_cnt;
    return_array[2] = price;
    return_array[3] = min_cnt;
    return return_array;
}

// ���̺긮�� �ɼ� ���� ����üũ
function set_amount_input(obj, key, type) {
    var opt_set_cnt = 0;
    var value = '';
    var opt_input_type = true;
    var cnt = $('#MS_basic_product').val();
    var prd_opt_cnt = 0;
    if (type == 'up' || type == 'down') {
        if (MOBILE_USE == '') {
            if ($('#hy_qrt_' + key).val() != undefined) {
                obj = document.getElementsByName('hy_qrt_' + key);
            } else {
                obj = $('#MS_amount_' + key);
                opt_input_type = false;
            }
            if (type == 'up') {
                if ($('#hy_qrt_' + key).val() != undefined) {
                    $('#hy_qrt_' + key).val($('#hy_qrt_' + key).val().numeric() + 1);
                    value = $('#hy_qrt_' + key).val();
                } else {
                    $('#MS_amount_' + key).val($('#MS_amount_' + key).val().numeric() + 1);
                    value = $('#MS_amount_' + key).val();
                    opt_input_type = false;
                }
                opt_set_cnt = 1;
            } else {
                if ($('#hy_qrt_' + key).val() != undefined) {
                    $('#hy_qrt_' + key).val($('#hy_qrt_' + key).val().numeric() - 1);
                    value = $('#hy_qrt_' + key).val();
                } else {
                    $('#MS_amount_' + key).val($('#MS_amount_' + key).val().numeric() - 1);
                    value = $('#MS_amount_' + key).val();
                    opt_input_type = false;
                }
                opt_set_cnt = -1;
            }
        } else {
            if (type == 'up') {
                $('#MS_amount_' + key).val($('#MS_amount_' + key).val().numeric() + 1);
                value = $('#MS_amount_' + key).val();
            } else if (type == 'down') { 
                $('#MS_amount_' + key).val($('#MS_amount_' + key).val().numeric() - 1);
                value = $('#MS_amount_' + key).val();
            } else {
                value = obj.value;
            }
        }
    } else {
        if ($('#hy_qrt_' + key).val() == undefined) {
            value = $('#MS_amount_' + key).val();
        } else {
            value = obj.value;
        }
    }
    
    $('#MS_amount_' + key).val(value);
    $('#hy_qrt_' + key).val(value);

    var group_opt_cnt = 0;
    var checked = false;
    if (MOBILE_USE != '') {
        var opt_id = $('#MS_amount_'+key).attr('opt_id');
        var opt_title = $('#MS_amount_'+key).attr('opt_title');
        var opt_value = $('#MS_amount_'+key).attr('value');
        var opt_name = $('#MS_amount_'+key).attr('opt_name');
        var amount_min = $('#MS_amount_'+key).attr('amount_min').split(",");
        var amount_max = $('#MS_amount_'+key).attr('amount_max').split(",");
        var opt_price = value * $('#chk_'+key).attr('opt_price');
        var sto_state = $('#MS_amount_'+key).attr('sto_state');
        var sto_unlimit = $('#MS_amount_'+key).attr('sto_unlimit');
        var sto_real_stock = $('#MS_amount_'+key).attr('sto_real_stock');
        // �ɼǱ׷캰 ���õ� �� 
        $('input[name="hy_option[]"]').each(function(i) {
            if ($(this).is(':checked') === true) {
            var _chk_id = $(this).attr('id').replace("chk_","");
            var str_id = _chk_id.split("_");
                if ($('#MS_amount_'+ _chk_id).val() != undefined && opt_id == str_id[0]) {
                    group_opt_cnt += $('#MS_amount_' + _chk_id).val().numeric();
                    is_checked = true;
                }
                prd_opt_cnt += $('#MS_amount_' + _chk_id).val().numeric();
            }      
        });
        if (opt_input_type === true) {
            var opt_total_chk = group_opt_cnt + opt_set_cnt;
        } else {
            var opt_total_chk = group_opt_cnt;
        }
    } else {
        var opt_id = $(obj).attr('opt_id');
        var opt_title = $(obj).attr('opt_title');
        var opt_value = $(obj).attr('value');
        var opt_name = $(obj).attr('opt_name');
        var amount_min = $(obj).attr('amount_min').split(",");
        var amount_max = $(obj).attr('amount_max').split(",");
        var opt_price = value * $('#chk_'+key).attr('opt_price');
        var sto_state = $(obj).attr('sto_state');
        var sto_unlimit = $(obj).attr('sto_unlimit');
        var sto_real_stock = $(obj).attr('sto_real_stock');
        var product_preivew = false;
        // �ɼǱ׷캰 ���õ� �� 
        $('input[name="hy_option[]"]').each(function(i) {
            if ($(this).is(':checked') === true) {
            var _chk_id = $(this).attr('id').replace("chk_","");
            var str_id = _chk_id.split("_");
                if ($('#hy_qrt_'+ _chk_id).val() != undefined && opt_id == str_id[0]) {
                    group_opt_cnt += $('#hy_qrt_'+ _chk_id).val().numeric();
                    is_checked = true;
                }
                prd_opt_cnt += $('#hy_qrt_' + _chk_id).val().numeric();
            }      
        });
        var opt_total_chk = group_opt_cnt;
    }
    var chk_cnt = 0;
    var prd_chk_info = this.product_chk_info(key);

    // �ɼ��� ǰ���̵Ȱ�� ��������ȵǵ��� üũ
    if ($(obj).is(':disabled') === true) {
        var _txt = '';
        if (sto_state == 'TEMPOUT') { _txt = get_lang('temporary'); } // �Ͻ� ǰ���� ��� '�Ͻ�' �޽��� �߰�
        $('#hy_qrt_' + key).val('1');
        alert(get_lang('selected_option_soldout', _txt));
        return;
    }
    amount_min[2] = (amount_min[2] == '') ? '1' : amount_min[2];

    if (amount_min[2] > opt_value.numeric() || (amount_max[2] < opt_value.numeric() && amount_max[2] > 0) && is_checked === true) {
        if (opt_value.numeric() > amount_max[2].numeric() && amount_max[2] > 0) {
            if (type == 'up') {
                opt_value = opt_value - 1;
            } else {
                opt_value = amount_min[2];
            }
        }
        if (opt_value.numeric() == 0) {
            alert(get_lang('hybrid_option2', opt_name, amount_min[2]));
            opt_value = amount_min[2];
            opt_price = opt_value * $('#MS_amount_'+key).attr('opt_price');
        } else {
            if (amount_min[2] > opt_value) {
                alert(get_lang('hybrid_option2', opt_name, amount_min[2]));
                opt_value = amount_min[2];
            } else if (amount_max[2] > 0) {
                alert(get_lang('hybrid_option', opt_name, amount_max[2]));
            }
            opt_price = opt_value * $('#chk_'+key).attr('opt_price');
        }
        // �������õȰ����� �Է�
        reset_option_value (opt_value, opt_price, key);
        return;
    } else if (opt_total_chk > 0 && (amount_min[1] > opt_total_chk || (amount_max[1] < opt_total_chk && amount_max[1] > 0)) && is_checked === true) {       // �ɼǱ׷캰 ���ż���üũ (�ּ�/�ִ�) ����üũ
        if (amount_min[1] == '') {
            alert(get_lang('hybrid_group_option2', opt_title, amount_max[1]));
        } else {
            alert(get_lang('hybrid_group_option', opt_title, amount_min[1], amount_max[1]));
        }
        if (opt_total_chk > amount_max[1].numeric() && amount_max[1] > 0) {
            if (type == 'up') {
                opt_value = opt_value - 1;
                opt_price = opt_value * $('#chk_'+key).attr('opt_price');
            } else {
                opt_value = amount_min[2];
                opt_price = amount_min[2] * $('#chk_'+key).attr('opt_price');
            }
        }
        // �������õȰ����� �Է�
        reset_option_value (opt_value, opt_price, key);
        return;
    } else if (prd_chk_info[0] > 0 && (amount_min[0] > prd_chk_info[0] || (amount_max[0] < prd_chk_info[0] && amount_max[0] > 0)) && is_checked === true) {       // ��ǰ�������� üũ (�ּ�/�ִ�) ����üũ
        if (amount_max[0] > 0) {
            alert(get_lang('hybrid_product', opt_title, amount_min[0], amount_max[0]));
        } else {
            alert(get_lang('hybrid_product1', opt_title, amount_min[0]));
        }

        if (type == 'up') {
            opt_value = opt_value - 1;
            opt_price = opt_value * $('#chk_'+key).attr('opt_price');
        } else {
            opt_value = amount_min[2];
            opt_price = opt_value * $('#chk_'+key).attr('opt_price');
        }
        // �������õȰ����� �Է�
        reset_option_value (opt_value, opt_price, key);
        return;
    }
    
    // �ɼǺ� ��������Ȱ�� ���üũ
    if (sto_unlimit == 'N' && (sto_real_stock < value.numeric())) {
        alert(get_lang('selected_option_lower_quantity'));
        if (MOBILE_USE == '') {
            $('#'+$(obj).attr('id')).val(value - 1);
        } else {
            $('#MS_amount_' + key).val($('#MS_amount_' + key).val() - 1);
        }
        return;
    }
    
    $('#MS_amount_' + key).val(value);
    $('#hy_qrt_' + key).val(value);
    $('#MK_p_price_' + key).text(opt_price);
    prd_chk_info = this.product_chk_info(key);
    $('#MK_total').text(prd_chk_info[0]);
    
    if (prd_chk_info[2] > 0) {
        $('#MK_opt_txt').css('display', "inline");
        $('#MK_txt-opt').text(prd_chk_info[2].number_format());
    } else {
        $('#MK_opt_txt').css('display', "none");
        $('#MK_txt-opt').text(prd_chk_info[2].number_format());
    }
    
    // �ɼ�üũ�Ȱ�쿡�� �ݾװ�����ش�.
    if (prd_chk_info[1] > 0) {
        this.sum_total_price2(prd_chk_info[2]); 
        $('#hybrid_op_price').val(prd_chk_info[2]);
    }
}

// ���̺긮�� �ɼ� ���� ���
function sum_total_price2(price) {
    var _product_price = option_manager.info.product_price.numeric();
    var _basic_price = 0;
    var _basic_single_price = 0;
    var _addition_price = 0;
    var _option_price = 0;
    var _stock = 1;
    var cnt = $('#MS_basic_product').val();
    var prd_chk_info = this.product_chk_info(price);
    
    // �⺻��ǰ���� + ���̺긮�� �ɼ� 
    _basic_price = (_product_price.numeric() * cnt) + (prd_chk_info[2].numeric() * cnt);

    // �����ɼ� �Ѱ��� ���
    $.map(option_manager.data.addition, function(data, idx) {
        if (data !== undefined) {
            $.map(data, function(_d, _i) {
                if (_d.opt_price) {
                    _addition_price += _d.opt_price * _d.opt_stock;
                }
            });
        }
    });

    // �⺻�ɼ�, �����ɼ� ������ ���� ����� ���ɼ��� �ֱ⿡ ���� �������
    // option_type == 'NO' �� ��� ������ ���� �ٸ�
    if (option_manager.info.option_type == 'NO') {
        _option_price = (_product_price * _stock).numeric();
    } else {
        _option_price = _basic_price.numeric() + _addition_price.numeric();
    }

    if ($('input[name=basic_product]').val() == undefined) {
        var _basic_product = cnt;
    } else {
        var _basic_product = $('input[name=basic_product]').val();
    }

    var prd_total_price = _product_price * _basic_product;

    $('#MK_txt-prd').text(prd_total_price.number_format());
    $('#MK_txt-opt').text(prd_chk_info[2]*cnt.number_format());
    $('#MK_innerOptPrice').css('display', "block");
    $('#price_text').text(_option_price.number_format()); 
    // �߰��ɼ� �ݾ�
    if(_addition_price > 0) {
        $('#MK_txt-add').text(_addition_price.number_format());
        $('#MK_innerOptAdd').css('display', "block");
    } else {
        $('#MK_txt-add').text('0');
    }
    $('#MK_p_total').text(_option_price.number_format());
}

// ���̺긮�� �⺻��ǰ ��������
function basic_product_amount(type) {
    if (type == 'up') {
        $('#MS_basic_product').val($('#MS_basic_product').val().numeric() + 1);
    } else if (type == 'down') {
        $('#MS_basic_product').val($('#MS_basic_product').val().numeric() - 1);
    } else {
        $('#MS_basic_product').val(type);
    }
    if ($('#MS_basic_product').val().numeric() == 0) {
        // ��ǰ�ֹ� �ּ� ���� 1�� üũ
        alert(get_lang('min_amount', 1));
        $('#MS_basic_product').val('1');
        return;
    }
    var cnt = $('#MS_basic_product').val();
    var prd_chk_info = this.product_chk_info(type);
    var opt_sum_price = prd_chk_info[2].numeric() * cnt;

    // ��ü���� ����� ���õ� �ɼ����üũ
    $('input[name="hy_option[]"]').each(function(i) {
        if ($(this).is(':checked') === true) {
            var _chk_id = $(this).attr('id').replace("chk_","");
            var str_id = _chk_id.substr(0,1);
            var sto_real_stock = $(this).attr('sto_real_stock');
            var sto_unlimit = $(this).attr('sto_unlimit'); 
            var opt_sum_value = $('#MS_amount_'+ _chk_id).val() * cnt;
            if (sto_unlimit == 'N' && (sto_real_stock < opt_sum_value.numeric())) {
                $('#MS_basic_product').val($('#MS_basic_product').val() - 1);
                alert(get_lang('selected_option_lower_quantity'));
                if (type == 'up' || type == 'down') {
                    $('#MS_basic_product').val(cnt - 1);
                } else {
                    $('#MS_basic_product').val('1');
                }
                cnt = $('#MS_basic_product').val();
                opt_sum_price = prd_chk_info[2].numeric() * cnt;
            }      
        }
    });

    var price_value = document.getElementById('pricevalue');
    var price = parseInt(document.getElementById('price_wh').value.replace(/,/g, ''), 10);   
    var total_price = price * cnt;
    this.sum_total_price2(total_price); 
    var prd_total_price = price * cnt;
    $('#MK_txt-opt').text(opt_sum_price.number_format());
    $('#MK_p_price_basic_0').text(prd_total_price.number_format() + get_lang('won'));
}

// ���̺긮�� �ɼ� ���̹���
function hybrid_img(img, type) {
    var _option = new StringBuffer();
    _option.append('<div><img src="'+ img +'" class="opt_m_img" border="0" /></div>');
    if (type == 'view') {
        $('#detailpage .thumb-wrap .thumb').parent().append(_option.toString());
        $('#detailpage .thumb-wrap .thumb').parent().append($('#detailpage .thumb-wrap .btns'));
        $('#detailpage .thumb-wrap .thumb').hide();
    } else {
        $('.opt_m_img').hide();
        $('#detailpage .thumb-wrap .thumb').show();
    }
}

// �ɼ� �������ѵ� ���  ���õ� �ɼǰ� ����
function reset_option_value (val, opt_price, key) {
    $('input[name=hy_qrt_' + key +']').val(val);
    $('#MS_amount_' + key).val(val);
    $('#MK_p_price_' + key).text(opt_price);
    prd_chk_info = this.product_chk_info(key);
    $('#MK_total').text(prd_chk_info[0]);
    if (prd_chk_info[2] > 0) {
        $('#MK_opt_txt').css('display', "inline");
        $('#MK_txt-opt').text(prd_chk_info[2].number_format());
    } else {
        $('#MK_opt_txt').css('display', "none");
        $('#MK_txt-opt').text(prd_chk_info[2].number_format());
    }
    if (prd_chk_info[1] > 0) {
        this.sum_total_price2(prd_chk_info[2]); 
        $('#hybrid_op_price').val(prd_chk_info[2]);
    }
    if(prd_chk_info[0] == 0) {
        $('#MK_innerOpt_03').parent().parent().parent().hide();
    }
}