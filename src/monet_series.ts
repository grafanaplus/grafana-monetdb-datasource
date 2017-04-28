import _ from 'lodash';
import queryPart from './query_part';

export default class MonetSeries {
    serie;
    alias;
    annotation;
    target;

    constructor(serie, target?, annotation?) {
        this.serie = serie;
        this.target = target;
        this.annotation = annotation;
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
            let label  = metricName + '_' + queryPart.create(t.select[fieldIndex][0]).render();
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
}
