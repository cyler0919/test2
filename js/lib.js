String.prototype.cut = function(len) {
    var str = this;
    var l = 0;
    for (var i=0; i<str.length; i++) {
        l += (str.charCodeAt(i) > 128) ? 2 : 1;
        if (l > len) return str.substring(0,i);
    }
    return str;
}

String.prototype.bytes = function() {
    var str = this;
    var l = 0;
    for (var i=0; i<str.length; i++) l += (str.charCodeAt(i) > 128) ? 2 : 1;
    return l;
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
