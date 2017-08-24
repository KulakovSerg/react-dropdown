import React, { Component } from 'react';
import PropTypes from 'prop-types';
import searchCache from 'SearchCache/SearchCache';
import i18n from 'util/i18n';
import Scroll from 'react-custom-scrollbars';
import './DropDown.scss';

export default class ReactDropdown extends Component {
    static defaultProps = {
        autoHeight: 400,
        autoHeightMax: 0,
    };
    static propTypes = {
        autoHeight: PropTypes.number,
        autoHeightMax: PropTypes.number,
    };
    state={
        searchString: '',
        items: [],
    };
    // componentDidMount() {
    //     if (searchCache.isCached) {
    //         this.setInitialItems();
    //     } else {
    //         searchCache.onCached(() => {
    //             this.setInitialItems();
    //         });
    //     }
    // }
    // setInitialItems() {
    //     this.setState(() => ({
    //         items: searchCache.search(),
    //     }));
    // }
    handleSearch(searchString) {
        this.setState(() => ({
            searchString,
            items: searchCache.search(searchString),
        }));
    }
    prepareText(text) {
        const searchString = this.state.searchString;
        let html;
        if (searchString) {
            const variants = searchCache.getTextVariants(text.toLowerCase());
            const variant = variants.filter(item => item.indexOf(searchString) !== -1)[0];
            const idx = variant.indexOf(searchString) === 0 ? 0 : variant.indexOf(` ${searchString}`) + 1;
            const selectedText = text.substr(idx, searchString.length);
            html = text.split(selectedText);
            // TODO когда транслитное значение длиннее исходного текста, то неверная подсветка
            html.splice(1, 0, (
                <em
                    className="drop-down__found-text"
                    key="em"
                >
                    {selectedText}
                </em>
            ));
        }
        return html || text;
    }
    toggleList(flag) {
        if (flag) {
            this.setState(() => ({
                items: searchCache.search(this.state.searchString),
            }));
        } else {
            this.setState(() => ({
                items: [],
            }));
        }
    }
    render() {
        return (
            <div className="drop-down">
                {
                    // TODO инпут полностью в десинке с android-кливиатурой, впервые такое вижу.
                    // Отдельный компонент input со своим state и shouldComponentUpdate() => false ?
                }
                <button
                    type="button"
                    className="drop-down__trigger"
                    onClick={() => this.toggleList(!this.state.items.length)}
                />
                <input
                    placeholder={i18n('ведите имя друга')}
                    className="drop-down__input"
                    type="text"
                    name="search"
                    value={this.state.searchString}
                    onChange={event => this.handleSearch(event.target.value)}
                    autoComplete="off"
                />
                {
                    this.state.items.length ?
                        <Scroll
                            hideTracksWhenNotNeeded
                            autoHeight={this.props.autoHeight}
                            autoHeightMax={this.props.autoHeightMax || this.props.autoHeight}
                            renderThumbVertical={props => <div {...props} className="drop-down__scroll-thumb-vertical" />}
                            renderTrackVertical={props => <div {...props} className="drop-down__scroll-vertical" />}
                            renderView={props => <ul {...props} className="drop-down__item-container" />}
                            className="drop-down__list-wrapper"
                        >
                            {
                                this.state.items.map((item, num) => (
                                    <li
                                        className="drop-down__item"
                                        key={num}
                                    >
                                        <img
                                            className="drop-down__avatar"
                                            src={item.avatar}
                                            alt=""
                                        />
                                        <div className="drop-down__item-header">
                                            {this.prepareText(item.fullName)}
                                        </div>
                                        <div className="drop-down__item-text">
                                            {item.study}
                                        </div>
                                    </li>
                                ))
                            }
                        </Scroll> :
                        null
                }
            </div>
        );
    }
}
