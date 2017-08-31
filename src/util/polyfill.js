if (!window.Promise) {
    window.Promise = require('core-js/library/es6/promise');
}

if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: require('core-js/library/es6/object').assign,
    });
}

if (!Array.prototype.find) {
    require('core-js/modules/es6.array.find');
}

if (!Array.prototype.findIndex) {
    require('core-js/modules/es6.array.find-index');
}

require('whatwg-fetch');
