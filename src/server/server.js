const express = require('express');

// cd ./src/server && node ../../node_modules/babel-cli/bin/babel.js ../util/util.js -d util.js && cd ../..
const util = require('./src/util/util.js');
const data = require('../../api/search.json');
const yargs = require('yargs').argv;
const path = require('path');

const app = express();
const port = yargs.port || 8080;

app
    .use('/', express.static('dist'))
    .use('/dist', express.static('dist'))
    .get('/', (req, res) => {
        res.sendFile(path.join(`${__dirname}/../../dist/index.html`));
    })
    .get('/search', (req, res) => {
        const query = req.query.q.toLowerCase();
        const result = {};
        Object.keys(data).forEach((key) => {
            let match;
            util.getTextVariants(data[key][2]).forEach((variant) => {
                if (variant.indexOf(query) !== -1) {
                    match = true;
                }
            });
            if (match) {
                result[key] = data[key];
            }
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    })
    .listen(port, () => {
        console.log(`Govnokod app is running on port ${port}!`);
    });
