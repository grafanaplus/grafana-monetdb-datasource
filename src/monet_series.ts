import _ from 'lodash';

export default class MonetSeries {
    series;
    alias;
    annotation;

    constructor(options) {
        this.series = options.series;
        this.alias = options.alias;
        this.annotation = options.annotation;
    }

    getTimeSeries() {
        return [];
    }

    _getSeriesName() {

    }

    getAnnotations() {

    }

    getTable() {}
}
