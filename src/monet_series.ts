import _ from 'lodash';
import queryPart from './query_part';
import TableModel from 'app/core/table_model';

export default class MonetSeries {
    serie;
    alias;
    annotation;
    target;

    constructor(serie, options?) {
        this.serie = serie;
        this.target = options.target;
        this.annotation = options.annotation;
    }

    /**
     * 
     * @param _target
     */
    asGraph(_target?) {
        let seriesList = [];
        let t = _target || this.target;
        let metricName = t.measurement;
        let resultColumnCount = this.serie.values[0] && this.serie.values[0].length || 0;
        let columnIndex = 1;
        let fieldIndex = 0; // field index in select part

        do {
            let alias;
            try {
                alias = t.select[fieldIndex].filter(next => next.type === 'alias')[0].params[0];
            } catch (err) {
                // console.log(err);
            }
            let label = t.alias || (metricName + '_' + (alias || queryPart.create(t.select[fieldIndex][0]).render()));
            let datapoints = [];
            for (let row of this.serie.values) {
                let ts = row[0] * 1000; // Grafana needs timestamps in ms
                let pointValue = row[columnIndex];
                let point = [pointValue, ts];
                datapoints.push(point);
            }
            seriesList.push({
                target: label,
                datapoints: datapoints
            });
            columnIndex += 1;
            fieldIndex += 1;
        } while (columnIndex < resultColumnCount);

        return seriesList;
    }

    asTable(_target?) {
        let table = new TableModel();
        // Seems nothng to do here for now.
    }

    getAnnotations() {
        let annotationList = [];
        for (let row of this.serie.values) {
            let ts = row[0] * 1000; // Grafana needs timestamps in ms
            let value = row[1];
            annotationList.push({
                annotation: this.annotation,
                tags: this.annotation.tagsColumn && this.annotation.tagsColumn.split(/,|\s/),
                text: this.annotation.textColumn,
                time: ts,
                title: this.annotation.titleColumn || value
            });
        }
        return annotationList;
    }

}
