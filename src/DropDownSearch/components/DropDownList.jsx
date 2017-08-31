import React from 'react';
import i18n from 'util/i18n';


function prepareText(props, text, id) {
    const searchString = props.searchString.toLowerCase();
    let html;
    if (searchString) {
        const { variantLength, searchPosition } = props.searchCache.getTextSearchPosition(searchString, id);
        if (variantLength) {
            const selectedText = text.substr(searchPosition, variantLength);
            html = text.split(selectedText);
            html.splice(1, 0, (
                <em
                    className="drop-down-search__found-text"
                    key="em"
                >
                    {selectedText}
                </em>
            ));
        }
    }
    return html || text;
}

/**
 * list of items
 */
export default function ReactDropdownList(props) {
    return props.items.length ?
        props.items.map((item, num) => (
            <li
                className="drop-down-search__item"
                key={num}
                onClick={() => { props.select(item.id); }}
            >
                { props.avatar ?
                    <img
                        className="drop-down-search__avatar"
                        src={item.avatar}
                        alt=""
                    />
                    : null
                }
                <div className="drop-down-search__item-header">
                    {props.searchString && !item.serverSearch ?
                        prepareText(props, item.fullName, item.id)
                        : item.fullName
                    }
                </div>
                <div className="drop-down-search__item-text">
                    {item.study}
                </div>
            </li>
        ))
        : (
            <li
                className="drop-down-search__item drop-down-search__item_not-found"
                onClick={props.toggleList}
            >
                {i18n('Пользователь не найден')}
            </li>
        );
}
