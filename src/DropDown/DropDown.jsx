import React, { Component } from 'react';
import './DropDown.scss';
import PropTypes from 'prop-types';
import searchCache from 'SearchCache/SearchCache';

export default class ReactDropdown extends Component {
    static defaultProps = {
    }
    static propTypes = {
    }
    state = {
        value: '',
        items: [],
    }
    onSearch(searchString){
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
        const lowerText = text.toLowerCase();
        const searchWithCase = text.substr(lowerText.indexOf(searchString), searchString.length);
        const html = text.split(searchWithCase);
        html.splice(1, 0, <em className="text_found" key="em">{searchWithCase}</em>);
        return (
            <span>
                {html}
            </span>
        )
    }
    render() {
        return (
            <div className="drop-down">
                <input
                    value={this.state.searchString}
                    onChange={event => {
                        this.onSearch(event.target.value);
                    }}
                />
                {
                    this.state.items ?
                    <ul>
                        {
                            this.state.items.map((item, num) => (
                                <li key={num}>
                                    {this.prepareText(item[0])}
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
