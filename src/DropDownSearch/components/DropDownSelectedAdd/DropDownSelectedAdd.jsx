import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'util/i18n';
import 'Button/Button.scss';
import iconPlus from 'Icon/Img/Plus.svg';

/**
 * selected items array
 */
export default class DropDownSelectedAdd extends Component {
    static defaultProps = {
        onClick: null,
    }
    static propTypes = {
        onClick: PropTypes.func,
    }
    render() {
        return (
            <div
                className="drop-down-search__add-selected  button button_inline button_light"
                onClick={this.props.onClick}
            >
                {i18n('Добавить')}
                <svg className="icon drop-down-search__add-icon button__icon icon_img_plus">
                    <use xlinkHref={iconPlus.url} />
                </svg>
            </div>
        );
    }
}
