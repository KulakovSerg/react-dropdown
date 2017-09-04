import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'util/i18n';
import './DropDownSelect.scss';

/**
 * dropdown header without autocomplete function
 */
export default class ReactDropdownSelect extends Component {
    static defaultProps = {
        isSelected: null,
        toggleList: null,
        children: null,
    };
    static propTypes = {
        /**
         * input value
         */
        isSelected: PropTypes.bool,
        /**
         * input onchange
         */
        toggleList: PropTypes.func,
        /**
         * selected items
         */
        children: PropTypes.arrayOf(PropTypes.element),
    };
    render() {
        return (
            <div
                onClick={() => {
                    this.props.toggleList();
                }}
                className="drop-down-search__header-content"
            >
                {this.props.children}
                { this.props.isSelected ?
                    null
                    : (<div className="drop-down-search__select-text">
                        {i18n('выберите друга из списка')}
                    </div>)
                }
            </div>
        );
    }
}
