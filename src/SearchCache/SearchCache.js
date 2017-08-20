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
}

// для более финальной реализации надо добавить еще спецсимволы и все то что по шифту

function reverseObj(hash) {
    return Object.keys(hash).reduce((result,key) => {
        if(hash[key].length === 1){
            result[hash[key]] = key;
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
    'и': 'i',
    'й': 'i',
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
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'shch',
    'ъ': 'ie',
    'ы': 'y',
    'ь': '\'',
    'э': 'e',
    'ю': 'iu',
    'я': 'ia',
}

const TRANS2CYR = reverseObj(CYR2TRANS);

export class SearchCache {
    loadedData = [];
    callstack = [];
    cache = {
        items: [],
    }

    /**
     * при поиске vk запросы на сервер уходят постоянно и данные могут дублироваться
     * в будущем имеет смысл сохранить адрес запроса, но про транспорт поиска друзей в задаче не было
     * @param data
     */
    addData(data){
        let newDataLength;
        const newData = Object.keys(data).reduce((result, key) => {
            if(!this.loadedData[key]){
                result[key] = data[key];
                this.loadedData[key] = data[key];
                newDataLength = true;
            }
            return result;
        }, {});
        if(newDataLength) {
            // чтобы меньше тормозило пока все считается
            setTimeout(() => {
                this.data2hash(newData);
            }, 0); // в зависимости от браузера вместо 0 будет 5 или 10
        }
    }

    /**
     * подготовка данных для поиска
     * @param data
     */
    data2hash(data){
        let text;
        Object.keys(data).forEach(key => {
            text = data[key][0].toLowerCase();
            this.addCache(text, data[key]);
            this.splitWords(text, data[key]);
            this.addInitialSearch(data[key]);
        });
        this.isCached = true;
        this.callstack.forEach(call => call());
        this.callstack = [];
    }

    onCached(callback){
        this.callstack.push(callback);
    }

    addInitialSearch(link){
        this.cache.items.push(link);
    }

    splitWords(text, link) {
        const words = text.split(' ').filter(item => item);
        // со 2 слова, первое и так добавится
        words.forEach((word, num) => {
            num && this.addCache(word, link)
        });
    }

    addCache(text, link) {
        // рекурсии - зло, цикл лучше
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
        // this.addText(text, link);
        // this.addLat(text, link);
        // this.addCyr(text, link);
        // this.addTrans(text, link);
        // this.addCyrTrans(text, link);
    }

    search(text) {
        if(text){
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
}

export default new SearchCache();