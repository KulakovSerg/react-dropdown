import React, { Component } from 'react';
import ReactDropDown from 'DropDown/DropDown.jsx';
import './Showcase.scss';

export default class Showcase extends Component {
    render() {
        return (
            <div className="showcase">
                <ReactDropDown />
            </div>
        );
    }
}
