import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchCache from 'SearchCache/SearchCache';
import DropDown from 'DropDown/DropDown';
import './DropDownSearch.scss';
import DropDownAutocomplete from './components/DropDownAutocomplete';
import DropDownSelected from './components/DropDownSelected';
import DropDownSelect from './components/DropDownSelect';
import dropDownList from './components/DropDownList';

/**
 * dropdown model-view component, only state container, no layout containing
 */
// "умный" компонент не содержит верстки, текстов и проч., но хранит и обрабатывает изменине состояний
// управляет "глупыми" компонентами, не содержищими состояний и принимающими на вход только свойства
// стандартная для React архитектура, в такой схеме части компонента быстро заменяются и легко переиспользуются
export default class ReactDropdownSearch extends Component {
    static defaultProps = {
        multiselect: false,
        serversearch: false,
        autocomplete: false,
        avatar: true,
        heightMax: undefined,
        searchCache: null,
        userInputDelay: 500,
        data: {},
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
        serversearch: PropTypes.bool,
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
        /**
         * delay keyboard input bewtween server requests
         */
        userInputDelay: PropTypes.number,
        /**
         * list data
         */
        data: PropTypes.object,
    };
    state={
        searchString: '',
        items: [],
        selectedItems: [],
        displayList: false,
    };
    componentWillMount() {
        this.searchCache = this.props.searchCache || new SearchCache(this.props.data, this.props.autocomplete);
    }
    delayedSearch;
    handleSearch(searchString) {
        const clientSearch = this.searchCache.search(searchString);
        const serverSearch = (this.props.serversearch && this.searchCache.getRequestCache(searchString)) || [];
        this.setState(() => ({
            searchString,
            displayList: true,
            items: this.filterDuplicates(clientSearch, serverSearch),
        }));
        if (this.props.serversearch && !serverSearch.length) {
            this.serverSearchDebounce(searchString);
        }
    }
    serverSearchDebounce(searchString) {
        if (this.delayedSearch) {
            clearTimeout(this.delayedSearch);
        }
        this.delayedSearch = setTimeout(() => {
            this.searchCache.serverSearch(searchString).then((serverSearch) => {
                this.delayedSearch = null;
                if (searchString !== this.state.searchString) {
                    this.serverSearchDebounce(this.state.searchString);
                } else {
                    this.setState({
                        items: this.filterDuplicates(this.state.items, serverSearch),
                    });
                }
            });
        }, this.props.userInputDelay);
    }
    filterDuplicates(clientSearch, serverSearch) {
        // тут можно и нормально сделать без перебора 100 раз, но времени уже нет менять все остальное
        const selectedMap = {};
        this.state.selectedItems.forEach((item) => { selectedMap[item.id] = true; });
        const map = {};
        const result = [];
        clientSearch.forEach((item) => {
            if (!selectedMap[item.id]) {
                result.push(item);
                map[item.id] = true;
            }
        });
        serverSearch.forEach((item) => {
            if (!map[item.id] && !selectedMap[item.id]) {
                result.push(item);
            }
        });
        return result;
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
            displayList: false,
        }));
        if (this.state.searchString) {
            this.handleSearch(this.state.searchString);
        }
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
