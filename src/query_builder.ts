import _ from 'lodash';


export default class MonetQueryBuilder {
    target;
    database;
    constructor(target, database) {
        this.target = target;
        this.database = database;
    }

    renderTagCondition(tag, index) {
        let str = '';
        let operator = tag.operator;
        let value = tag.value;
        if (index > 0) {
            str = (tag.condition || 'AND') + ' ';
        }

        if (!operator) {
            // if (/^\/.*\/$/.test(tag.value)) {
            //     operator = '=~';
            // } else {
            //     operator = '=';
            // }
            operator = '=';
        }

        // quote value unless regex or number
        if (operator !== '=~' && operator !== '!~' && isNaN(+value)) {
            value = "'" + value + "'";
        }

        return str + '"' + tag.key + '" ' + operator + ' ' + value;
    }


    buildExploreQuery(type) {
        let query;
        switch (type) {
            case "MEASURMENTS": {
                query = 'SELECT name as measurements from metrics';
            };
            default: break;
        }

        return query;
    }

}
