import React, { Component } from 'react';
import './DropDown.scss';
import PropTypes from 'prop-types';
import searchCache from 'SearchCache/SearchCache';

export default class ReactDropdown extends Component {
    static defaultProps = {}
    static propTypes = {}
    state={
        searchString: '',
        items: [],
    }
    handleSearch(searchString){
        this.setState(() => {
            return {
                searchString,
                items: searchCache.search(searchString),
            }
        });
    }
    componentDidMount() {
        if(searchCache.isCached){
            this.setInitialItems();
        } else {
            searchCache.onCached(() => {
                this.setInitialItems();
            });
        }
    }
    setInitialItems() {
        this.setState(() => ({
            items: searchCache.search(),
        }));
    }
    prepareText(text){
        const searchString = this.state.searchString;
        if(!searchString){
            return (
                <span>
                    {text}
                </span>
            );
        }
        const variants = searchCache.getTextVariants(text.toLowerCase());
        const variant = variants.filter(variant => variant.indexOf(searchString) !== -1)[0];
        const idx = variant.indexOf(searchString) === 0 ? 0 : variant.indexOf(' ' + searchString) + 1;
        const selectedText = text.substr(idx, searchString.length);
        const html = text.split(selectedText);
        html.splice(1, 0, <em className="text_found" key="em">{selectedText}</em>);
        return (
            <span>
                {html}
            </span>
        )
    }
    render() {
        return (
            <div className="drop-down">
                <form>
                    <input
                        type="text"
                        name="search"
                        value={this.state.searchString}
                        onChange={event => this.handleSearch(event.target.value) }
                    />
                </form>
                {
                    this.state.items ?
                    <ul>
                        {
                            this.state.items.map((item, num) => (
                                <li key={num}>
                                    {this.prepareText(item.fullName)}
                                </li>
                            ))
                        }
                    </ul> :
                    null
                }
            </div>
        );
    }
}
