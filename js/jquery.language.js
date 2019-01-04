var mk_language = (function(lang) {
    var obj = {
        kor: {
            non_option_txt: '선택안함',
            soldout_txt: '품절',
            tempsoldout_txt: '일시품절',
            shipping_txt: '배송지연',
            no_input_txt: '입력안함',
            stock_title: '재고수량',
            stock_unit: '개',
            stock_unlimit: '무제한',
            enter: '입력',
            select: '선택',
            empty_option: '선택할 옵션이 없습니다.',
            option_label: '[{#P1}]의 옵션은 ',
            require_option: '{#P1}필수{#P2} 항목입니다.\n옵션을 반드시 {#P2}하세요.',
            require_option2: '[{#P1}]의 옵션은 필수{#P2} 항목입니다.\n옵션을 반드시 {#P2}하세요.',
            require_option3: '필수{#P1} 항목입니다. 옵션을 반드시 {#P1}하세요.',
            temporary: '일시',
            selected_option_soldout: '선택하신 상품의 옵션은 {#P1}품절되었습니다.\n다른 옵션을 선택하세요.',
            selected_product_soldout: '선택하신 상품이 {#P1}품절되었습니다.\n다른 상품을 선택하세요.',
            selected_option_lower_quantity: '선택하신 상품의 옵션은 수량이 부족합니다.\n수량을 조절해주세요.',
            option_added: '이미 추가된 옵션입니다.',
            quantity_numbers: '수량은 숫자만 입력해주세요.',
            min_amount: '해당 상품은 최소구매 수량이 {#P1}개 입니다.',
            min_amount2: '수량은 최소 {#P1}이상 입력하셔야 합니다.',
            max_amount: '해당 상품은 최대구매 수량이 {#P1}개 입니다.',
            increase_quantity: '수량증가',
            decrease_quantity: '수량감소',
            won: '원',
            remove: '삭제',
            not_selected: '선택된 옵션이 없습니다.',
            not_select_product : '선택된 상품이 없습니다.',
            hybrid_product : '이 상품에서는 최소({#P2})개 부터 최대({#P3})까지 \n선택이 가능합니다.',
            hybrid_product1 : '이 상품에서는 최소({#P2})개 \n선택이 가능합니다.',
            hybrid_product2 : '이 상품에서는 최대({#P2})까지 \n선택이 가능합니다.',
            hybrid_group_option : '{#P1}그룹에서는 최소({#P2})개 부터 최대({#P3})까지 \n선택이 가능합니다.',
            hybrid_group_option2 : '{#P1}그룹에서는 최대({#P2})까지 \n선택이 가능합니다.',
            hybrid_option : '{#P1}옵션은 최대({#P2})개까지 \n선택이 가능합니다.',
            hybrid_option2 : '{#P1}옵션의 최소구매 수량이({#P2})개 입니다.',
            extra_require : '[{#P1}] 은(는) 필수로 선택해야하는 추가 구성 상품 입니다.\n상품을 선택해주세요.',
            extra_main_not_selected : '[{#P1}] 은(는) 필수로 선택해야하는 메인 상품입니다.\n상품을 선택해주세요.'
        },
        eng: {
            non_option_txt: 'No selected',
            soldout_txt: 'Out-of-stock',
            tempsoldout_txt: 'Temporarily Out-of-stock',
            shipping_txt: 'Shipping delay',
            no_input_txt: 'No entering',
            stock_title: 'stock',
            stock_unit: 'ea',
            stock_unlimit: 'Unlimited',
            enter: 'enter',
            select: 'select',
            empty_option: 'There is no option to select.',
            option_label: ' of {#P1} ',
            require_option: 'The option{#P1} is required.\nPlease {#P2} the option.',
            require_option2: 'The option of [{#P1}] is required.\nPlease {#P2} the option.',
            require_option3: 'Selection is required. Please {#P1} the option.',
            temporary: 'temporary ',
            selected_option_soldout: 'The item of the selected option is {#P1}out of stock.\nPlease select another option.',
            selected_product_soldout: 'The item of the selected product is {#P1}out of stock.\nPlease select another product.',
            selected_option_lower_quantity: 'Stock quantity is lower than selected quantity.\nPlease adjust the quantity.',
            option_added: 'The option has already been added.',
            quantity_numbers: 'Please enter the quantity numbers.',
            min_amount: 'The minimum purchase quantity is {#P1}.',
            min_amount2: 'You must enter at least {#P1} or more for the minimun purchase quantity.',
            max_amount: 'The maximum purchase quantity is {#P1}.',
            increase_quantity: 'Increase quantity',
            decrease_quantity: 'Decrease quantity',
            won: 'won',
            remove: 'Delete',
            not_selected: 'option is not selected.',
            not_select_product : 'selected product does not exist',
            hybrid_product : '이 상품에서는 최소({#P2})개 부터 최대({#P3})까지 \n선택이 가능합니다.',
            hybrid_product1 : '이 상품에서는 최소({#P2})개 \n선택이 가능합니다.',
            hybrid_product2 : '이 상품에서는 최대({#P2})까지 \n선택이 가능합니다.',
            hybrid_group_option : '{#P1}그룹에서는 최소({#P2})개 부터 최대({#P3})까지 \n선택이 가능합니다.',
            hybrid_group_option2 : '{#P1}그룹에서는 최대({#P2})까지 \n선택이 가능합니다.',
            hybrid_option : '{#P1}옵션은 최대({#P2})개까지 \n선택이 가능합니다.',
            hybrid_option2 : '{#P1}옵션의 최소구매 수량이({#P2})개 입니다.',
            extra_require : '[{#P1}] 은(는) 필수로 선택해야하는 추가 구성 상품 입니다.\n상품을 선택해주세요.',
            extra_main_not_selected : '[{#P1}] 은(는) 필수로 선택해야하는 메인 상품입니다.\n상품을 선택해주세요.'
        }
    };
    return obj[lang];
})(shop_language);

var get_lang = function() {
    var _len = arguments.length;
    switch (_len) {
        case 0: return false; break;
        case 1: return mk_language[arguments[0]]; break;
        default:
            var _str = mk_language[arguments[0]];
            for (var i = 1; i < _len; i++) {
                var _regexp = new RegExp('{#P' + i + '}', 'g');
                _str =  _str.replace(_regexp, arguments[i]);
            }
            return _str;
            break;
    }
};
