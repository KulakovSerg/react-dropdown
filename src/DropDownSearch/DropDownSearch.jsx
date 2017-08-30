import React, { Component } from 'react';
import PropTypes from 'prop-types';
import searchCache, { SearchCache } from 'SearchCache/SearchCache';
import DropDown from 'DropDown/DropDown';
import './DropDownSearch.scss';
import DropDownAutocomplete from './elements/DropDownAutocomplete';
import DropDownSelected from './elements/DropDownSelected';
import DropDownSelect from './elements/DropDownSelect';
import dropDownList from './elements/DropDownList';

/**
 * dropdown model-view component, only state container, no layout containing
 */
// "умный" компонент не содержит верстки, текстов и проч., но хранит и обрабатывает изменине состояний
// управляет "глупыми" компонентами, не содержищими состояний и принимающими на вход только свойства
// стандартная для React архитектура, в такой схеме части компонента быстро заменяются и легко переиспользуются
export default class ReactDropdownSearch extends Component {
    static defaultProps = {
        multiselect: false,
        serversearch: '',
        autocomplete: false,
        avatar: true,
        heightMax: undefined,
        searchCache: null,
    };
    // оверхед в виде propTypes выполняет проверки только на дев-сборке, при минификации на прод отпиливается полностью
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
        /**
         * alternative searchCache instance
         */
        searchCache: PropTypes.object,
    };
    state={
        searchString: '',
        items: [],
        selectedItems: [],
        displayList: false,
    };
    componentWillMount() {
        // TODO индекс генерирутеся составляется всегда, но можно сделать более красиво,
        // если передавать инстанс только когда нужно. Если не передавать, то не будет шариться между разными списками
        // this.searchCache = this.props.searchCache || new SearchCache(this.props.autocomplete);
        this.searchCache = this.props.searchCache || searchCache;
    }
    handleSearch(searchString) {
        this.setState(() => ({
            searchString,
            displayList: true,
            items: this.searchCache.search(searchString),
        }));
    }
    toggleList() {
        this.setState(state => ({
            displayList: !state.displayList,
            items: !state.displayList && !state.items.length && !state.searchString ?
                this.searchCache.search('')
                : state.items,
        }));
    }
    select(id) {
        const selectedItems = this.props.multiselect ? this.state.selectedItems : [];
        const item = this.searchCache.get(id);
        if (!this.props.multiselect || selectedItems.indexOf(item) === -1) {
            selectedItems.push(item);
        }
        this.setState(() => ({
            selectedItems,
            items: [],
            displayList: false,
        }));
    }
    removeSelected(num) {
        const selectedItems = this.state.selectedItems.slice();
        selectedItems.splice(num, 1);
        this.setState(() => ({
            selectedItems,
            items: [],
        }));
    }
    render() {
        const selectedItems = DropDownSelected(
            this.state.selectedItems,
            (num) => { this.removeSelected(num); },
        );
        const header = this.props.autocomplete ?
            (<DropDownAutocomplete
                className="drop-down-search__header-content"
                searchString={this.state.searchString}
                handleSearch={(str) => { this.handleSearch(str); }}
                isSelected={!!this.state.selectedItems.length}
            >
                {selectedItems}
            </DropDownAutocomplete>) :
            (<DropDownSelect
                className="drop-down-search__header-content"
                isSelected={!!this.state.selectedItems.length}
                toggleList={() => { this.toggleList(); }}
            >
                {selectedItems}
            </DropDownSelect>);
        return (
            <DropDown
                className="drop-down-search"
                opened={this.state.items.length}
                heightMax={this.props.heightMax}
                buttonOnClick={() => { this.toggleList(); }}
                header={header}
            >
                {this.state.displayList ? dropDownList({
                    items: this.state.items,
                    select: (id) => { this.select(id); },
                    searchCache: this.searchCache,
                    searchString: this.state.searchString,
                    avatar: this.props.avatar,
                    toggleList: () => { this.toggleList(); },
                }) : null}
            </DropDown>
        );
    }
}
