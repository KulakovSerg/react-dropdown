import React from 'react';
import './DropDownSelected.scss';
import 'Button/Button.scss';
import 'Icon/Icon.scss';
import iconDelete from 'Icon/Img/Delete.svg';

/**
 * selected items array
 */
export default function DropDownSelected(items, removeSelected) {
    return items.map((item, num) => (
        <div
            className="drop-down-search__selected-item button button_inline"
            onClick={(event) => { event.stopPropagation(); }}
            key={num}
        >
            {item.fullName}
            <button
                type="button"
                className="drop-down-search__selected-item-remove button__icon"
                onClick={() => { removeSelected(num); }}
            >
                <svg className="icon icon_img_delete" viewBox={iconDelete.viewBox}>
                    <use xlinkHref={iconDelete.url} />
                </svg>
            </button>
        </div>
    ));
}
