import React, { Component } from 'react';
import PropTypes from 'prop-types';
import searchCache from 'SearchCache/SearchCache';
import Scroll from 'react-custom-scrollbars';
import './DropDown.scss';

/**
 * simple dropdown list component
 */
export default class ReactDropdown extends Component {
    static defaultProps = {
        /**
         * header component
         */
        header: undefined,
        /**
         * maximum height of dropdown list before scroll
         */
        heightMax: 400,
        /**
         * onclick button function
         */
        buttonOnClick: undefined,
        /**
         * if button should be shown
         */
        displayButton: true,
    };
    static propTypes = {
        header: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.object,
            PropTypes.string,
        ]),
        heightMax: PropTypes.number,
        buttonOnClick: PropTypes.func,
        displayButton: PropTypes.bool,
    };
    render() {
        return (
            <div className="drop-down">
                <button
                    type="button"
                    className="drop-down__trigger"
                    onClick={this.props.buttonOnClick}
                />
                {this.props.header}
                {
                    this.props.children.length ?
                        <Scroll
                            hideTracksWhenNotNeeded
                            autoHeight
                            autoHeightMax={this.props.heightMax}
                            renderThumbVertical={props => <div {...props} className="drop-down__scroll-thumb-vertical" />}
                            renderTrackVertical={props => <div {...props} className="drop-down__scroll-vertical" />}
                            renderView={props => <ul {...props} className="drop-down__item-container" />}
                            className="drop-down__list-wrapper"
                        >
                            { this.props.children }
                        </Scroll> :
                        null
                }
            </div>
        );
    }
}
