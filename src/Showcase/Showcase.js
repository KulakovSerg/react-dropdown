import React from 'react';
import 'util/polyfill';
import { render } from 'react-dom';
import Showcase from './Showcase.jsx';

render(React.createElement(Showcase), document.querySelector('.content'));

if (module.hot) {
    module.hot.accept('./Showcase.jsx', () => {
        render(React.createElement(Showcase), document.querySelector('.content'));
    });
}
