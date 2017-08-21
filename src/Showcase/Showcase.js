import React from 'react';
import { render } from 'react-dom';
import Showcase from './Showcase.jsx';
import searchCache from 'SearchCache/SearchCache';
import data from '../../api/search.json'; // что-то похожее на выдачу vk

searchCache.addData(data);

render(React.createElement(Showcase), document.querySelector('.content'));

if (module.hot) {
    module.hot.accept('./Showcase.jsx', () => {
        render(React.createElement(Showcase), document.querySelector('.content'));
    });
}
