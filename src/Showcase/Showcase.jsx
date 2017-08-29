import React, { Component } from 'react';
import DropDownSearch from 'DropDownSearch/DropDownSearch.jsx';
import './Showcase.scss';

export default class Showcase extends Component {
    render() {
        return (
            <div className="showcase">
                <DropDownSearch
                    avatars
                    multiselect
                    autocomplete
                />
            </div>
        );
    }
}
