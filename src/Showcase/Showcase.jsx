import React, { Component } from 'react';
import DropDownSearch from 'DropDownSearch/DropDownSearch.jsx';
import './Showcase.scss';
import data from '../../api/search.json'; // что-то похожее на выдачу vk

export default class Showcase extends Component {
    render() {
        return (
            <div className="showcase">
                <DropDownSearch
                    multiselect
                    autocomplete
                    serversearch
                    avatar
                    // searchCache = {new SearchCache(data, true)} //можно передать тут инстанс searchCache
                    // чтобы пошарить поиск и кеш между несколькими экземплярами
                    data={data}
                />
            </div>
        );
    }
}
