import React from 'react';

/**
 * selected items array
 */
export default function DropDownSelected(items, removeSelected) {
    return items.map((item, num) => (
        <div
            className="drop-down-search__selected-item"
            onClick={(event) => { event.stopPropagation(); }}
            key={num}
        >
            {item.fullName}
            <button
                type="button"
                className="drop-down-search__selected-item-remove"
                onClick={() => { removeSelected(num); }}
            />
        </div>
    ));
}
