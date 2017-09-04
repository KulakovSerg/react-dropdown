import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scroll from 'react-custom-scrollbars';
import iconArrowDown from 'Icon/Img/ArrowDown.svg';
import 'Icon/Icon.scss';
import './DropDown.scss';

/**
 * simple dropdown list component
 */
export default class ReactDropdown extends Component {
    static defaultProps = {
        /**
         * header component
         */
        header: null,
        /**
         * maximum height of dropdown list before scroll
         */
        heightMax: 400,
        /**
         * onclick button function
         */
        buttonOnClick: null,
        /**
         * if button should be shown
         */
        displayButton: true,
        /**
         * display dropdown list
         */
        displayList: false,
        /**
         * dropdown items list
         */
        children: null,
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
        displayList: PropTypes.bool,
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.element),
            PropTypes.element,
        ]),
    };
    render() {
        return (
            <div className="drop-down">
                <button
                    type="button"
                    className="drop-down__trigger icon"
                    onClick={this.props.buttonOnClick}
                >
                    <svg className="drop-down__trigger-icon icon icon_img_arrow-down">
                        <use xlinkHref={iconArrowDown.url} />
                    </svg>
                </button>
                {this.props.header}
                {
                    this.props.children ?
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
