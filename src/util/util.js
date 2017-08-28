import CYR2LAT from './cirilicKeyboard.json';

// Правила транслитерации: [ Как все привыкли (из головы), Passport (2013) ICAO, ISO 9:1995, ISO/R 9 (1968) ]
import CYR2TRANS from './translitRules.json';
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
    return Object.keys(source).reduce((result, key) => {
        result[source[key]] = key;
        return result;
    }, {});
}

/**
 * reverse keyboard hash
 */
const LAT2CYR = reverseObj(CYR2LAT);

let transMaxLen = 1;
Object.keys(CYR2TRANS).forEach((key) => {
    if (typeof CYR2TRANS[key] !== 'string' && CYR2TRANS[key].length > transMaxLen) {
        transMaxLen = CYR2TRANS[key].length;
    }
});

// чтобы не сломать случайно пересохраняю в константу
const LONGEST_TRANS = transMaxLen;

/**
 * @private
 */
function reverseTranslit(source) {
    // из каждого варианта транслитерации создается хеш и хеши записываются в массив - дубли есть,
    // но так обход потом потом быстрее и проще
    const result = [];
    const resultLong = [];
    for (let i = 0; i < LONGEST_TRANS; i++) {
        result[i] = {};
        resultLong[i] = {};
    }
    let val;
    let target;
    let transliteration;
    Object.keys(source).forEach((key) => {
        val = source[key];
        for (let i = 0; i < LONGEST_TRANS; i++) {
            transliteration = typeof val === 'string' ? val : val[i];
            if (transliteration) {
                target = transliteration.length > 1 ? resultLong : result;
                target[i][transliteration] = key;
            }
        }
    });
    return [
        result,
        resultLong,
    ];
}

/**
 * reverse transliteration hashes
 */
const [TRANS2CYR, TRANS2CYR_LONG] = reverseTranslit(CYR2TRANS);

/**
 * transform given text by pattern key-value
 * @private
 * @param {string} text
 * @param {Object} transformer
 * @idx transliteration varaint number
 * @returns {string}
 */
export function transformText(text, transformer, idx) {
    let result = '';
    for (let i = 0, latter; i < text.length; i++) {
        latter = text[i];
        if (typeof transformer[latter] === 'object') {
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
export function cyr2lat(text) {
    return transformText(text, CYR2LAT);
}

/**
 * latin keyboard input to cyrillic
 * @private
 * @param {string} text
 * @returns {string}
 */
export function lat2cyr(text) {
    return transformText(text, LAT2CYR);
}

/**
 * transliterate cyrillic text
 * @private
 * @param {number} translitNum
 * @param {string} text
 * @returns {string}
 */
export function cyr2trans(translitNum, text) {
    return transformText(text, CYR2TRANS, translitNum);
}

/**
 * detransliterate cyrillic text
 * @private
 * @param {string} text
 * @returns {string}
 */
export function trans2cyr(translitNum, text) {
    Object.keys(TRANS2CYR_LONG[translitNum]).forEach((key) => {
        let index = text.indexOf(key);
        while (index !== -1) {
            text = text.substring(0, index) +
                TRANS2CYR_LONG[translitNum][key] +
                text.substring(index + key.length, text.length);
            index = text.indexOf(key);
        }
    });
    return transformText(text, TRANS2CYR[translitNum]);
}

/**
 * array of transliteration functions. Order = search results order
 */
export const TRANSLITERATORS = [
    cyr2lat,
    lat2cyr,
    // тут можно добавить еще раскладки клавиатуры и прочие варианты
    // порядок = ранджирование в поиске
];

/**
 * array of reverse transliteration functions. Order = TRANSLITERATORS order
 */
export const DETRANSLITERATORS = [
    lat2cyr,
    cyr2lat,
];

// Такой вот костыль появился, чтобы добавить произвольное число транслитераций в поисковый индекс
const transliteratorVariants = [
    cyr2trans, // транслитерированный текст
    (num, text) => lat2cyr(cyr2trans(num, text)), // транслитерированный текст в русской раскладке
    trans2cyr, // для поиска английских слов на русском - детранслитерированный текст
];

const detransliteratorVariants = [
    trans2cyr,
    (num, text) => cyr2lat(cyr2trans(num, text)),
    cyr2trans,
];

const transliteratorsInitCount = TRANSLITERATORS.length;
for (let i = 0; i < LONGEST_TRANS; i++) {
    for (let j = 0; j < transliteratorVariants.length; j++) {
        TRANSLITERATORS[transliteratorsInitCount + i + (j * LONGEST_TRANS)] = transliteratorVariants[j].bind(null, i);
        DETRANSLITERATORS[transliteratorsInitCount + i + (j * LONGEST_TRANS)] = detransliteratorVariants[j].bind(null, i);
    }
}

/**
 * returns text with first word removed or empty string
 * @param {string} text
 * @returns {string}
 */
export function cutFirstWord(text) {
    // не использую тут регулярные выражения потому что они медленнее indexOf
    // и очень простая операция
    const idx = text.indexOf(' ');
    return idx === -1 ? '' : text.substr(idx + 1, text.length);
}

/**
 * reverse text transliteration by given algorithm number
 * @param {string} text
 * @param {number} idx
 * @returns {string}
 */
export function detransliterate(text, idx) {
    return DETRANSLITERATORS[idx](text);
}

/**
 * returns position of search in text in beginning of text jr words only
 * @param {string} text
 * @param {string} search
 * @returns {number}
 */
export function getIndexOfWordBeginning(text, search) {
    let position = text.indexOf(search);
    if (position === -1) {
        position = text.indexOf(` ${search}`);
        if (position !== -1) {
            position += 1;
        }
    }
    return position;
}
