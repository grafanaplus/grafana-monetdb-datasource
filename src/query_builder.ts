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
            case 'METRICS': {
                query = "SELECT name FROM tables WHERE schema_id=(SELECT id as id FROM schemas WHERE name='timetrails')";
                break;
            };
            case 'FIELDS': {
                query = `SELECT * FROM timetrails.measures('${this.target.measurement}')`;
                break;
            }
            default: break;
        }

        return query;
    }

}
