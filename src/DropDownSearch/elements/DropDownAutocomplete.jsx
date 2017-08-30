import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'util/i18n';
import classnames from 'classnames';
import './DropDownAutocomplete.scss';

/**
 * dropdown header with autocomplete function
 */
export default class ReactDropdownAutocomplete extends Component {
    static defaultProps = {
        searchString: null,
        handleSearch: null,
        className: null,
        children: null,
        isSelected: null,
    };
    static propTypes = {
        /**
         * input value
         */
        searchString: PropTypes.string,
        /**
         * input onchange
         */
        handleSearch: PropTypes.func,
        /**
         * additional class name for container element
         */
        className: PropTypes.string,
        /**
         * selected items
         */
        children: PropTypes.arrayOf(PropTypes.element),
        /**
         * if there are selected items input style should be changed
         */
        isSelected: PropTypes.bool,
    };
    focusInput() {
        if (this.inputNode) {
            this.inputNode.focus();
        }
    }
    render() {
        return (
            <div
                onClick={() => {
                    this.focusInput();
                }}
                className={classnames(
                    'drop-down-autocomplete',
                    this.props.className,
                )}
            >
                {this.props.children}
                <input
                    placeholder={i18n('Введите имя друга')}
                    className={classnames(
                        'drop-down-autocomplete__input',
                        this.props.isSelected && 'drop-down-autocomplete__input_inline',
                    )}
                    type="text"
                    name="search"
                    value={this.props.searchString}
                    onChange={(event) => { this.props.handleSearch(event.target.value); }}
                    autoComplete="off"
                    ref={(node) => { this.inputNode = node; }}
                />
            </div>
        );
    }
}
