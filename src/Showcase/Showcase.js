import React from 'react';
import { render } from 'react-dom';
import Showcase from './Showcase.jsx';
import friends from "../../api/friends.json";

render(React.createElement(Showcase), document.querySelector('.content'));

if (module.hot) {
    module.hot.accept('./Showcase.jsx', () => {
        render(React.createElement(Showcase), document.querySelector('.content'));
    });
}

window._friends = friends;