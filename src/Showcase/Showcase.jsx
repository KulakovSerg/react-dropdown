import React, { Component } from 'react';
import ReactDropDown from 'DropDown/DropDown.jsx';

export default class Showcase extends Component {
    render() {
        return (
            <div className="showcase">
                <div className="drop-down">
                    <ReactDropDown />
                </div>
            </div>
        );
    }
}
