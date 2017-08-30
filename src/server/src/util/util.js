'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DETRANSLITERATORS = exports.TRANSLITERATORS = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// Правила транслитерации: [ Как все привыкли (из головы), Passport (2013) ICAO, ISO 9:1995, ISO/R 9 (1968) ]


exports.transformText = transformText;
exports.cyr2lat = cyr2lat;
exports.lat2cyr = lat2cyr;
exports.cyr2trans = cyr2trans;
exports.trans2cyr = trans2cyr;
exports.cutFirstWord = cutFirstWord;
exports.detransliterate = detransliterate;
exports.getIndexOfWordBeginning = getIndexOfWordBeginning;
exports.getTextVariants = getTextVariants;

var _cirilicKeyboard = require('../../../util/cirilicKeyboard.json');

var _cirilicKeyboard2 = _interopRequireDefault(_cirilicKeyboard);

var _translitRules = require('../../../util/translitRules.json');

var _translitRules2 = _interopRequireDefault(_translitRules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// решил объединить в 1 хеш 4 вариантов, чуть медленнее чем раздельно, но гораздо удобнее редактировать и расширять
// можно все прописать сразу все варианты в обе стороны константами, но за счет экономии небольшого количетсва
// процессорного времени получаем сложности при редактировании и рост по трафику

// если текст от разных способов транслитерации будет дублироваться то эти варианты не будут добавлены в поиск
// также фильтруются и повторные вхождения того же самого результата в этот же индекс
// Щ выше Ч и Ш иначе Щ никогда не транслитерируется

// расширить эту реализацию другими раскладками клавиатуры можно быз проблем, а вот из-за подсветки просто
// добавить новые транслитерации не получится - напримен немецкое ß будет заменять собой все ss и те места
// где ss появляется в результате 1 из русских транслитераций, поэтому для добавления новых языков
// понадобится отдельное определение раскладки. Сделать потом можно, но задачка большая и нужен список языков
// Возможно, под все это есть готовые бибилиотеки, но задача ставилась их не использовать (обычно с точки
// зрения бизнеса выгодно как раз использовать по максимуму все сторонее, чтобы быстрее написать и быстрее
// оттестировать)

/**
 * @private
 */
function reverseObj(source) {
    return Object.keys(source).reduce(function (result, key) {
        result[source[key]] = key;
        return result;
    }, {});
}

/**
 * reverse keyboard hash
 */
var LAT2CYR = reverseObj(_cirilicKeyboard2.default);

var transMaxLen = 1;
Object.keys(_translitRules2.default).forEach(function (key) {
    if (typeof _translitRules2.default[key] !== 'string' && _translitRules2.default[key].length > transMaxLen) {
        transMaxLen = _translitRules2.default[key].length;
    }
});

// чтобы не сломать случайно пересохраняю в константу
var LONGEST_TRANS = transMaxLen;

/**
 * @private
 */
function reverseTranslit(source) {
    // из каждого варианта транслитерации создается хеш и хеши записываются в массив - дубли есть,
    // но так обход потом потом быстрее и проще
    var result = [];
    var resultLong = [];
    for (var i = 0; i < LONGEST_TRANS; i++) {
        result[i] = {};
        resultLong[i] = {};
    }
    var val = void 0;
    var target = void 0;
    var transliteration = void 0;
    Object.keys(source).forEach(function (key) {
        val = source[key];
        for (var _i = 0; _i < LONGEST_TRANS; _i++) {
            transliteration = typeof val === 'string' ? val : val[_i];
            if (transliteration) {
                target = transliteration.length > 1 ? resultLong : result;
                target[_i][transliteration] = key;
            }
        }
    });
    return [result, resultLong];
}

/**
 * reverse transliteration hashes
 */

var _reverseTranslit = reverseTranslit(_translitRules2.default),
    _reverseTranslit2 = _slicedToArray(_reverseTranslit, 2),
    TRANS2CYR = _reverseTranslit2[0],
    TRANS2CYR_LONG = _reverseTranslit2[1];

/**
 * transform given text by pattern key-value
 * @private
 * @param {string} text
 * @param {Object} transformer
 * @idx transliteration varaint number
 * @returns {string}
 */


function transformText(text, transformer, idx) {
    var result = '';
    for (var i = 0, latter; i < text.length; i++) {
        latter = text[i];
        if (_typeof(transformer[latter]) === 'object') {
            result += transformer[latter][idx];
        } else {
            result += transformer[latter] || text[i];
        }
    }
    return result;
}

/**
 * cyrillic keyboard input to latin
 * @private
 * @param {string} text
 * @returns {string}
 */
function cyr2lat(text) {
    return transformText(text, _cirilicKeyboard2.default);
}

/**
 * latin keyboard input to cyrillic
 * @private
 * @param {string} text
 * @returns {string}
 */
function lat2cyr(text) {
    return transformText(text, LAT2CYR);
}

/**
 * transliterate cyrillic text
 * @private
 * @param {number} translitNum
 * @param {string} text
 * @returns {string}
 */
function cyr2trans(translitNum, text) {
    return transformText(text, _translitRules2.default, translitNum);
}

/**
 * detransliterate cyrillic text
 * @private
 * @param {string} text
 * @returns {string}
 */
function trans2cyr(translitNum, text) {
    Object.keys(TRANS2CYR_LONG[translitNum]).forEach(function (key) {
        var index = text.indexOf(key);
        while (index !== -1) {
            text = text.substring(0, index) + TRANS2CYR_LONG[translitNum][key] + text.substring(index + key.length, text.length);
            index = text.indexOf(key);
        }
    });
    return transformText(text, TRANS2CYR[translitNum]);
}

/**
 * array of transliteration functions. Order = search results order
 */
var TRANSLITERATORS = exports.TRANSLITERATORS = [cyr2lat, lat2cyr];

/**
 * array of reverse transliteration functions. Order = TRANSLITERATORS order
 */
var DETRANSLITERATORS = exports.DETRANSLITERATORS = [lat2cyr, cyr2lat];

// Такой вот костыль появился, чтобы добавить произвольное число транслитераций в поисковый индекс
var transliteratorVariants = [cyr2trans, // транслитерированный текст
function (num, text) {
    return lat2cyr(cyr2trans(num, text));
}, // транслитерированный текст в русской раскладке
trans2cyr];

var detransliteratorVariants = [trans2cyr, function (num, text) {
    return cyr2lat(cyr2trans(num, text));
}, cyr2trans];

var transliteratorsInitCount = TRANSLITERATORS.length;
for (var i = 0; i < LONGEST_TRANS; i++) {
    for (var j = 0; j < transliteratorVariants.length; j++) {
        TRANSLITERATORS[transliteratorsInitCount + i + j * LONGEST_TRANS] = transliteratorVariants[j].bind(null, i);
        DETRANSLITERATORS[transliteratorsInitCount + i + j * LONGEST_TRANS] = detransliteratorVariants[j].bind(null, i);
    }
}

/**
 * returns text with first word removed or empty string
 * @param {string} text
 * @returns {string}
 */
function cutFirstWord(text) {
    // не использую тут регулярные выражения потому что они медленнее indexOf
    // и очень простая операция
    var idx = text.indexOf(' ');
    return idx === -1 ? '' : text.substr(idx + 1, text.length);
}

/**
 * reverse text transliteration by given algorithm number
 * @param {string} text
 * @param {number} idx
 * @returns {string}
 */
function detransliterate(text, idx) {
    return DETRANSLITERATORS[idx](text);
}

/**
 * returns position of search in text in beginning of text jr words only
 * @param {string} text
 * @param {string} search
 * @returns {number}
 */
function getIndexOfWordBeginning(text, search) {
    var position = text.indexOf(search);
    if (position === -1) {
        position = text.indexOf(' ' + search);
        if (position !== -1) {
            position += 1;
        }
    }
    return position;
}

/**
 * serverside search
 * @param text
 * @returns {Array}
 */
function getTextVariants(text) {
    text = text.toLowerCase();
    return [text].concat(TRANSLITERATORS.map(transliterator => transliterator(text)));
}
