const CYR2LAT = {
    'й': 'q',
    'ц': 'w',
    'у': 'e',
    'к': 'r',
    'е': 't',
    'н': 'y',
    'г': 'u',
    'ш': 'i',
    'щ': 'o',
    'з': 'p',
    'х': '[',
    'ъ': ']',
    'ф': 'a',
    'ы': 's',
    'в': 'd',
    'а': 'f',
    'п': 'g',
    'р': 'h',
    'о': 'j',
    'л': 'k',
    'д': 'l',
    'ж': ';',
    'э': '\'',
    'я': 'z',
    'ч': 'x',
    'с': 'c',
    'м': 'v',
    'и': 'b',
    'т': 'n',
    'ь': 'm',
    'б': ',',
    'ю': '.',
    'ё': '`',
};

// для более финальной реализации надо добавить в список еще спецсимволы и все то, что по шифту
// + из других языков

function reverseObj(source) {
    return Object.keys(source).reduce((result,key) => {
        if(source[key].length === 1){
            result[source[key]] = key;
        }
        return result;
    },{});
}

const LAT2CYR = reverseObj(CYR2LAT);

// Passport (2013), ICAO
const CYR2TRANS = {
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'е': 'e',
    'ё': 'e',
    'ж': 'zh',
    'з': 'z',
    'й': 'i',
    'и': 'i',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'kh',
    'ц': 'ts',
    'щ': 'shch',
    'ч': 'ch',
    'ш': 'sh',
    'ъ': 'ie',
    'ы': 'y',
    'ь': '\'',
    'э': 'e',
    'ю': 'iu',
    'я': 'ia',
}

const TRANS2CYR = reverseObj(CYR2TRANS);

const TRANS2CYR_LONG = Object.keys(CYR2TRANS).reduce((result,key) => {
    if(CYR2TRANS[key].length > 1){
        result[CYR2TRANS[key]] = key;
    }
    return result;
},{});

export class SearchCache {
    loadedData = [];
    callbacks = [];
    cache = {
        items: [],
    }
    variantsCache = {};

    // комменты для jsdoc должны быть англицйские на всякий случай, но по коду тольео для
    // тестового задания пришу на русском
    /**
     * inserts search data
     * @param data
     */
    /*
     * при поиске vk запросы на сервер уходят постоянно и данные могут дублироваться
     * имеет смысл сохранять адрес запроса и повторно его не слать, но про транспорт
     * в задании не было
     */
    addData(data){
        let newDataLength;
        const newData = Object.keys(data).reduce((result, key) => {
            if(!this.loadedData[key]){
                result[key] = this._parse(data[key], key);
                this.loadedData[key] = result[key];
                newDataLength = true;
            }
            return result;
        }, {});
        if(newDataLength) {
            // чтобы меньше тормозило пока все считается выкидываю в конец очереди - после рендера
            setTimeout(() => {
                this._data2hash(newData);
            }, 0); // в зависимости от браузера вместо 0 будет 5 или 10
        }
    }

    /**
     * search by words
     * @param text
     * @returns {Array}
     */
    search(text) {
        if(text){
            text = text.toLowerCase();
            let node = this.cache;
            while(text){
                node = node[text[0]];
                if(!node){
                    break;
                }
                text = text.substring(1);
            }
            return node ? node.items : [];
        } else {
            return this.cache.items;
        }
    }

    /**
     * add cache finished callback
     * @param callback
     */
    onCached(callback){
        this.callbacks.push(callback);
    }

    /**
     * returns all variants of text typing
     * @param text
     */
    getTextVariants(text){
        if(this.variantsCache[text]){
            return this.variantsCache[text];
        }
        const trans = this._cyr2trans(text);
        // из-за полностью английских имен приходится делать больше вариантов,
        // которые могут повторяться
        const variants = [
            text,
            this._cyr2lat(text),
            this._lat2cyr(text),
            trans,
            this._lat2cyr(trans),
            this._trans2cyr(text),
        ];
        const uniqueVariants = [];
        variants.forEach(variant => {
            if(uniqueVariants.indexOf(variant) === -1){
                uniqueVariants.push(variant);
            }
        });
        this.variantsCache[text] = uniqueVariants;
        return uniqueVariants;
    }

    /**
     * transforms input data
     * @private
     * @param fullName
     * @param avatar
     * @param pageName
     * @param group
     * @param city
     * @param id
     * @returns {{id: *, fullName: *, avatar: *, pageName: *, group: *, city: *}}
     */
    _parse([fullName, avatar, pageName, group, city], id){
        return {
            id,
            fullName,
            avatar,
            pageName,
            group,
            city,
        }
    }

    /**
     * rrepare cache from given data
     * @private
     * @param data
     */
    _data2hash(data){
        let text;
        let item;
        Object.keys(data).forEach(key => {
            item = data[key];
            text = item.fullName.toLowerCase();
            this._addCacheVariants(text, item);
            this._splitWords(text, item);
            this._addInitialSearch(item);
        });
        this.isCached = true;
        this.callbacks.forEach(callback => callback());
        this.callbacks = [];
    }

    /**
     * save item for empty search request output
     * @param link
     */
    _addInitialSearch(link){
        this.cache.items.push(link);
    }

    /**
     * split name by words and add them all to cache
     * @private
     * @param text
     * @param link
     */
    _splitWords(text, link) {
        const words = text.split(' ').filter(item => item);
        // со 2 слова, первое и так добавится
        words.forEach((word, num) => {
            num && this._addCacheVariants(word, link)
        });
    }

    /**
     * add all variants of given item to cache
     * @private
     * @param text
     * @param link
     */
    _addCacheVariants(text, link){
        this.getTextVariants(text).forEach(variant => {
            this._addCache(variant, link);
        });
    }

    /**
     * add given item to cache
     * @private
     * @param text
     * @param link
     */
    _addCache(text, link) {
        // рекурсии - зло, цикл дешевле
        let node = this.cache;
        let letter;
        while(text){
            letter = text[0];
            if(!node[letter]){
                node[letter] = {
                    items: [
                        link,
                    ],
                }
            } else {
                node[letter].items.push(link);
            }
            node = node[letter];
            text = text.substring(1);
        }
    }

    /**
     * transform given text by pattern key-value
     * @private
     * @param text
     * @param transformer
     * @returns {string}
     */
    _transformText(text, transformer){
        let result = '';
        for(let i = 0; i<text.length; i++){
            result+=transformer[text[i]] || text[i];
        }
        return result;
    }

    /**
     * cyrillic keyboard input to latin
     * @private
     * @param text
     * @returns {string}
     */
    _cyr2lat(text) {
        return this._transformText(text, CYR2LAT);
    }

    /**
     * latin keyboard input to cyrillic
     * @private
     * @param text
     * @returns {string}
     */
    _lat2cyr(text) {
        return this._transformText(text, LAT2CYR);
    }

    /**
     * transliterate cyrillic text
     * @private
     * @param text
     * @returns {string}
     */
    _cyr2trans(text) {
        return this._transformText(text, CYR2TRANS);
    }

    /**
     * detransliterate cyrillic text
     * @private
     * @param text
     * @returns {string}
     */
    _trans2cyr(text) {
        Object.keys(TRANS2CYR_LONG).forEach(key => {
            text = text.replace(key, TRANS2CYR_LONG[key]);
        });
        return this._transformText(text, TRANS2CYR);
    }
}

// синглтон (микросервис поисковой выдачи)
export default new SearchCache();
