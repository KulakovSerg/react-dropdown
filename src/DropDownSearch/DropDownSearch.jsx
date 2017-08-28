import React, { Component } from 'react';
import PropTypes from 'prop-types';
import searchCache from 'SearchCache/SearchCache';
import i18n from 'util/i18n';
import DropDown from 'DropDown/DropDown';
import './DropDownSearch.scss';

/**
 * dropdown list component
 */
export default class ReactDropdown extends Component {
    static defaultProps = {
        multiselect: false,
        serversearch: '',
        autocomplete: false,
        avatar: true,
        heightMax: undefined,
    };
    static propTypes = {
        /**
         * ability to select multiple items in a list
         */
        multiselect: PropTypes.bool,
        /**
         * url to search on server
         */
        serversearch: PropTypes.string,
        /**
         * use client-side autocomplete for input
         */
        autocomplete: PropTypes.bool,
        /**
         * show user avatars in search results
         */
        avatar: PropTypes.bool,
        /**
         * maximum height of dropdown list before scroll
         */
        heightMax: PropTypes.number,
    };
    state={
        searchString: '',
        items: [],
    };
    handleSearch(searchString) {
        this.setState(() => ({
            searchString,
            items: searchCache.search(searchString),
        }));
    }
    prepareText(text, id) {
        const searchString = this.state.searchString.toLowerCase();
        let html;
        if (searchString) {
            const { variantLength, searchPosition } = searchCache.getTextSearchPosition(searchString, id);
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
    toggleList(flag) {
        if (flag) {
            this.setState(() => ({
                items: searchCache.search(this.state.searchString),
            }));
        } else {
            this.setState(() => ({
                items: [],
            }));
        }
    }
    render() {
        const input = (
            <input
                placeholder={i18n('ведите имя друга')}
                className="drop-down-search__input"
                type="text"
                name="search"
                value={this.state.searchString}
                onChange={event => this.handleSearch(event.target.value)}
                autoComplete="off"
            />
        );
        return (
            <DropDown
                opened={this.state.items.length}
                heightMax={this.props.heightMax}
                buttonOnClick={() => this.toggleList(!this.state.items.length)}
                header={input}
            >
                {
                    this.state.items.map((item, num) => (
                        <li
                            className="drop-down-search__item"
                            key={num}
                        >
                            { this.props.avatar ?
                                <img
                                    className="drop-down-search__avatar"
                                    src={item.avatar}
                                    alt=""
                                />
                                : null
                            }
                            <div className="drop-down-search__item-header">
                                {this.prepareText(item.fullName, item.id)}
                            </div>
                            <div className="drop-down-search__item-text">
                                {item.study}
                            </div>
                        </li>
                    ))
                }
            </DropDown>
        );
    }
}
