import { TRANSLITERATORS, cutFirstWord, getIndexOfWordBeginning, detransliterate } from 'util/util.js';

export default class SearchCache {
    index = {
        items: [],
    };
    hash = {};
    translitCache = {};
    needIndex = false;
    serverSearchCache = {};

    /**
     * constructor
     * @param data
     * @param needIndex
     */
    constructor(data, needIndex = false) {
        this.needIndex = needIndex;
        if (data) {
            this.addDataAsync(data);
        }
    }

    // комменты для jsdoc пишу на своем рунглише на всякий случай,
    // но только для тестового задания - проясенния по коду на русском "почему именно так сделал"
    /**
     * inserts search data
     * @param {Object} data
     */
    addData(data) {
        // в предыдущих пулреквестах код был покрасивее
        // но место нагруженное и я решил немного оптимизировать
        // поэтому точка входа такая с вложенными циклами
        let link;
        let lowerText;
        // циклы for..in или что-то более оптимальное по помяти eslint рекомендует заменить на такую запись
        Object.keys(data).forEach((key) => {
            link = this.parse(data[key], key);
            this.index.items.push(link);
            this.hash[link.id] = link;
            if (this.needIndex) {
                lowerText = link.fullName.toLowerCase();
                // сразу добавляем в индекс нетранслитерированные имена и входящие в них слова
                this.addCacheWords(lowerText, link, lowerText);
                // чтобы не проверить лишний раз внутри функции передаю тут текст дважды,
                // во всех других ее вызовах текст разный
                this.translitCache[key] = [lowerText];
            }
        });
        if (this.needIndex) {
            // тут такие циклы вместо foreach чтобы не плодить скоупы лишние
            for (let i = 0, transText, transliterator; i < TRANSLITERATORS.length; i++) {
                transliterator = TRANSLITERATORS[i];
                // чтобы сохранить ранжирование транслитерированных значений приходится делать вложенный цикл по
                // вариантам транслитерации
                for (let j = 0; j < this.index.items.length; j++) {
                    link = this.index.items[j];
                    lowerText = link.fullName.toLowerCase();
                    transText = transliterator(lowerText);
                    // this.translitCache - чтобы не добавлялся повторяющийся текст в index, например одинаковая
                    // транслитерация, которая случается на полностью английских словах
                    // этот же кеш потом используется для подсветки найденной подстроки
                    // Данную проверку можно ускорить, если вместо Array и indexOf использовать Map где link в качетсве
                    // ключей
                    if (this.translitCache[link.id].indexOf(transText) === -1) {
                        // транслитерированные имена и слова из них добавляются в индекс
                        // порядок ранжирования будет соответствовать порядку транслитеров
                        this.addCacheWords(lowerText, link, transText, transliterator);
                    }
                    // добавляю кеш и для повторов, чтобы потом при подсветке найденной подстроки точно определить номер
                    // алгоритма транслитерации
                    this.translitCache[link.id].push(transText);
                }
            }
        }

        // изначально вариант транслитерации был только 1 и весь алгоритм расчитан на то, что добавляемые в индекс
        // варианты слов не имеют повторяющихся частей. Когда вариантов транслита стало 4, появилось множество
        // повторяющихся частей, поэтому в целях ускорения постороения индекса логично было бы не добавлять их целиком,
        // а делать ветвление в момент расхождения способов транслитерации. Но это излишне усложнит весь алгоритм

        // если бы я не усложнил себе задачу подсветкой найденной подстроки, то алгоритм был бы другим, написание и
        // проверка кода заняли бы в гораздо меньше времени
    }

    /**
     * add data in the end of event loop
     * @param data
     */
    addDataAsync(data) {
        setTimeout(() => {
            this.addData(data);
        });
    }

    /**
     * search by words
     * @param {string} text
     * @returns {Array}
     */
    search(text) {
        if (text) {
            text = text.toLowerCase();
            let node = this.index;
            for (let i = 0; i < text.length; i++) {
                node = node[text[i]];
                if (!node) {
                    break;
                }
            }
            return node ? node.items : [];
        }
        return this.index.items;
    }
    // test:
    // рого => Андрей Рогозов
    // hjuj => Андрей Рогозов
    // rogo => Андрей Рогозов
    // кщпщ => Андрей Рогозов
    // sergey => Сергей Щербаков
    // sergej => Сергей Щербаков
    // sergejj => Сергей Щербаков
    // sherb => Сергей Щербаков
    // shherb => Сергей Щербаков
    // shch => Сергей Щербаков
    // server:
    // drew => Андрей Рогозов
    // sound => Богдан Чадкин

    /**
     * returns all variants of transliterated strings
     * @param {string} key
     * @returns string[]
     */
    getCachedVariants(key) {
        return this.translitCache[key];
    }

    /**
     * returns first position of searchString found in item with given id
     * @param {string} searchString
     * @param {string} id
     * @returns {{variantLength: number, searchPosition: number}}
     */
    getTextSearchPosition(searchString, id) {
        const variants = this.getCachedVariants(id);
        let variantLength;
        let searchPosition = getIndexOfWordBeginning(variants[0], searchString);
        if (searchPosition === -1) {
            let variant;
            let variantIdx;
            for (variantIdx = 0; !variant && variantIdx < variants.length; variantIdx++) {
                if (variants[variantIdx].indexOf(searchString) !== -1) {
                    variant = variants[variantIdx];
                }
            }

            if (variant) {
                searchPosition = getIndexOfWordBeginning(variant, searchString);
                // TODO кажется есть проблемы с подствекой "кщпщ" и "she" - частичная транслитерация
                // Можно быстро решить путем хранения в индексе строки для выделения, но тогда он ОЧЕНЬ сильно вздуется
                // а пока что тут костыль, который решает проблему только для русской транслитерации
                variantLength = Math.min(detransliterate(searchString, variantIdx - 2).length, searchString.length);
            }
        } else {
            variantLength = searchString.length;
        }
        return { variantLength, searchPosition };
    }

    /**
     * transforms input data item
     * @private
     * @param {string} fullName
     * @param {string} avatar
     * @param {string} pageName
     * @param {string} group
     * @param {string} city
     * @param {string} id
     * @returns {{id: *, fullName: *, avatar: *, pageName: *, group: *, city: *}}
     */
    parse([fullName, avatar, pageName, group, study], id, serverSearch) {
        return {
            id,
            fullName,
            avatar,
            pageName,
            group,
            study,
            serverSearch,
        };
    }

    /**
     * add text to index and all worlds of text too
     * @private
     * @param {text} text - source text
     * @param {Object} link - link to indexing object
     * @param {text} translitedFullText - put here already prepared text to prevent double transliteration
     * @param {function} [transliterator] - transliteration function
     */
    addCacheWords(text, link, translitedFullText, transliterator) {
        this.addCache(translitedFullText, link);
        while (text = cutFirstWord(text)) {
            this.addCache(transliterator ? transliterator(text) : text, link);
        }
    }

    /**
     * add given item to index
     * @private
     * @param {string} text - transliterated name variant
     * @param {Object} link - item to add
     */
    addCache(text, link) {
        // рекурсии - зло, цикл дешевле
        let node = this.index;
        let letter;
        while (text) {
            letter = text[0];
            if (!node[letter]) {
                node[letter] = {
                    items: [
                        link,
                    ],
                };
                // может дублироваться при совпадении начала имени и фамилии или их транслитерации
                // Эту проверку можно ускорить если заменить массив на Map с ключами link
            } else if (node[letter].items.indexOf(link) === -1) {
                node[letter].items.push(link);
            }
            node = node[letter];
            text = text.substring(1);
        }
    }

    /**
     * return user by id
     * @param {string} id
     * @returns {Object}
     */
    get(id) {
        return this.hash[id];
    }

    /**
     * if request is already completed returns cached else fetch server
     * @param query
     * @returns {Promise}
     */
    serverSearch(query) {
        if (this.serverSearchCache[query]) {
            return new Promise((resolve) => {
                resolve(this.serverSearchCache[query]);
            });
        }
        return fetch(`/search?q=${query}`).then(response => response.json().then((data) => {
            this.serverSearchCache[query] = Object.keys(data).map((key) => {
                this.hash[key] = this.parse(data[key], key, true);
                return this.hash[key];
            });
            return this.serverSearchCache[query];
        }));
    }

    /**
     * returns cached search request result
     * @param query
     * @returns {Array}
     */
    getRequestCache(query) {
        return this.serverSearchCache[query] || [];
    }
}
