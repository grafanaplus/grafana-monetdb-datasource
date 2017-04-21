import _ from 'lodash';

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
        let resultColumnCount = this.serie.values[0].length;
        let columnIndex = 1;

        do {
            let label  = metricName + '_' + columnIndex;
            let datapoints = [];
            for (let row of this.serie.values) {
                let ts = row[0];
                let pointValue = row[columnIndex];
                let point = [pointValue, ts];
                datapoints.push(point);
            }
            seriesList.push({
                target: label,
                datapoints: datapoints
            });
            columnIndex += 1;
        } while (columnIndex < resultColumnCount);

        return seriesList;
    }
}
