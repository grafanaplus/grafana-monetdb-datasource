import _ from 'lodash';
import queryPart from './query_part';
import kbn from 'app/core/utils/kbn';
import { TS_COLUMN_NAME } from './constants';
import { QueryEditorError } from './error';

export default class MonetQuery {
  target: any;
  selectModels: any[];
  queryBuilder: any;
  groupByParts: any;
  templateSrv: any;
  scopedVars: any;

  /** @ngInject */
  constructor(target, templateSrv?, scopedVars?) {
    this.target = target;
    this.templateSrv = templateSrv;
    this.scopedVars = scopedVars;

    target.policy = target.policy || 'default';
    target.dsType = 'monetdb';
    target.resultFormat = target.resultFormat || 'time_series';
    target.orderByTime = target.orderByTime || 'ASC';
    // tag columns
    target.tags = target.tags || [];
    // N/A in Monet
    target.groupBy = target.groupBy || [
      { type: 'time', params: ['$__interval'] },
      // {type: 'fill', params: ['null']},
    ];
    target.select = target.select || [[
      { type: 'field', params: ['value'] },
      { type: 'avg', params: [] },
    ]];

    this.updateProjection();
  }

  updateProjection() {
    this.selectModels = _.map(this.target.select, function (parts: any) {
      return _.map(parts, queryPart.create);
    });
    this.groupByParts = _.map(this.target.groupBy, queryPart.create);
  }

  updatePersistedParts() {
    this.target.select = _.map(this.selectModels, function (selectParts) {
      return _.map(selectParts, function (part: any) {
        return { type: part.def.type, params: part.params };
      });
    });
  }


  hasGroupByTime() {
    return _.find(this.target.groupBy, (g: any) => g.type === 'time');
  }

  hasFill() {
    return _.find(this.target.groupBy, (g: any) => g.type === 'fill');
  }

  addGroupBy(value) {
    var stringParts = value.match(/^(\w+)\((.*)\)$/);
    var typePart = stringParts[1];
    var arg = stringParts[2];
    var partModel = queryPart.create({ type: typePart, params: [arg] });
    var partCount = this.target.groupBy.length;

    if (partCount === 0) {
      this.target.groupBy.push(partModel.part);
    } else if (typePart === 'time') {
      this.target.groupBy.splice(0, 0, partModel.part);
    } else if (typePart === 'tag') {
      if (this.target.groupBy[partCount - 1].type === 'fill') {
        this.target.groupBy.splice(partCount - 1, 0, partModel.part);
      } else {
        this.target.groupBy.push(partModel.part);
      }
    } else {
      this.target.groupBy.push(partModel.part);
    }

    this.updateProjection();
  }

  removeGroupByPart(part, index) {
    var categories = queryPart.getCategories();

    if (part.def.type === 'time') {
      // remove fill
      this.target.groupBy = _.filter(this.target.groupBy, (g: any) => g.type !== 'fill');
      // remove aggregations
      this.target.select = _.map(this.target.select, (s: any) => {
        return _.filter(s, (part: any) => {
          var partModel = queryPart.create(part);
          if (partModel.def.category === categories.Aggregations) {
            return false;
          }
          if (partModel.def.category === categories.Selectors) {
            return false;
          }
          return true;
        });
      });
    }

    this.target.groupBy.splice(index, 1);
    this.updateProjection();
  }

  removeSelect(index: number) {
    this.target.select.splice(index, 1);
    this.updateProjection();
  }

  removeSelectPart(selectParts, part) {
    // if we remove the field remove the whole statement
    if (part.def.type === 'field') {
      if (this.selectModels.length > 1) {
        var modelsIndex = _.indexOf(this.selectModels, selectParts);
        this.selectModels.splice(modelsIndex, 1);
      }
    } else {
      var partIndex = _.indexOf(selectParts, part);
      selectParts.splice(partIndex, 1);
    }

    this.updatePersistedParts();
  }

  addSelectPart(selectParts, type) {
    var partModel = queryPart.create({ type: type });
    partModel.def.addStrategy(selectParts, partModel, this);
    this.updatePersistedParts();
  }

  private renderTagCondition(tag, index, interpolate) {
    var str = "";
    var operator = tag.operator;
    var value = tag.value;
    if (index > 0) {
      str = (tag.condition || 'AND') + ' ';
    }

    if (!operator) {
      // if (/^\/.*\/$/.test(value)) {
      //   operator = '=~';
      // } else {
      //   operator = '=';
      // }
      operator = '=';
    }

    // quote value unless regex
    if (operator !== '=~' && operator !== '!~') {
      if (interpolate) {
        value = this.templateSrv.replace(value, this.scopedVars);
      }
      if (operator !== '>' && operator !== '<') {
        value = "'" + value.replace(/\\/g, '\\\\') + "'";
      }
    } else if (interpolate) {
      value = this.templateSrv.replace(value, this.scopedVars, 'regex');
    }

    return str + tag.key + ' ' + operator + ' ' + value;
  }

  getMeasurementAndPolicy(interpolate) {
    var policy = this.target.policy;
    var measurement = this.target.measurement || 'measurement';

    if (interpolate) {
      measurement = this.templateSrv.replace(measurement, this.scopedVars, 'regex');
    }

    if (policy !== 'default') {
      policy = this.target.policy + '.';
    } else {
      policy = "";
    }

    return policy + 'timetrails.' + measurement;
  }

  interpolateQueryStr(value, variable, defaultFormatFn) {
    // if no multi or include all do not regexEscape
    if (!variable.multi && !variable.includeAll) {
      return value;
    }

    if (typeof value === 'string') {
      return kbn.regexEscape(value);
    }

    var escapedValues = _.map(value, kbn.regexEscape);
    return escapedValues.join('|');
  };

  /**
   * Render SELECT field names only.
   */
  renderSelectFieldNames() {
    let selectFieldsArr = [];
    for (let model of this.selectModels) {
      selectFieldsArr = selectFieldsArr.concat(model.filter(next => next.part.type === 'field'));
    }
    return selectFieldsArr.map(field => field.render()).join(', ');
  }

  /**
   * Render SELECT fields with or without aggregate function.
   */
  renderSelectFieldExpressions() {
    let selectFieldsArr = [];
    for (let model of this.selectModels) {
      if (model.length > 1) {
        selectFieldsArr = selectFieldsArr.concat(model.reduce((acc, curr) => {
          return curr.render(acc.render());
        }));
      } else {
        selectFieldsArr = selectFieldsArr.concat(model.map(field => field.render()));
      }
    }
    return selectFieldsArr.join(', ');
  }

  renderWhereConditions(interpolate?) {
    let conditionsArr = [];
    conditionsArr = conditionsArr.concat(this.target.tags.map((tag, index) => this.renderTagCondition(tag, index, interpolate)));
    let conditionStr = conditionsArr.join(' ');
    return conditionStr ? `${conditionStr} AND $timeFilter` : '$timeFilter';
  }

  /**
   * Render group by fields.
   */
  renderGroupBy() {
    let groupByArr = [];
    groupByArr = groupByArr.concat(this.groupByParts.filter(part => part.def.type !== 'time').map(part => part.render()));
    return groupByArr.join(', ');
  }

  renderWithTimeInterval(interval: Number, interpolate?) {
    let selectFieldNames = this.renderSelectFieldNames();
    let selectFieldExpressions = this.renderSelectFieldExpressions();
    let tableName = this.getMeasurementAndPolicy(interpolate);
    let whereConditionsText = this.renderWhereConditions();
    let groupByTagText = this.renderGroupBy();
    let groupByText = groupByTagText ? `period, ${groupByTagText}` : 'period';
    let groupByPeriodAndTagText = groupByTagText ? `(sys.epoch(${TS_COLUMN_NAME})/${interval}) as period, ${groupByTagText}` : `(sys.epoch(${TS_COLUMN_NAME})/${interval}) as period`;

    let query = `WITH T(${TS_COLUMN_NAME}, ${selectFieldNames}, ${groupByText})
            AS (SELECT ${TS_COLUMN_NAME}, ${selectFieldNames}, ${groupByPeriodAndTagText} FROM ${tableName}
            WHERE ${whereConditionsText})
        SELECT cast(avg(sys.epoch(${TS_COLUMN_NAME})) as int), ${selectFieldExpressions}
        FROM T 
        GROUP BY ${groupByText}`;

    return query;
  }

  timeIntervalAsSeconds(): Number {
    let timePart = this.groupByParts.filter(part => part.def.type === 'time')[0];
    let interval = timePart.params[0];
    if (interval === 'auto') {
      interval = this.scopedVars.interval.value;
    }
    let parts = /^(\d+)([h|m|s])$/.exec(interval);
    if (!parts) {
      throw new QueryEditorError('Invalid Time Interval!');
    }
    let n = parseInt(parts[1]);
    let unit = parts[2];
    if (unit === 's') {
      return n;
    }
    if (unit === 'm') {
      return 60*n;
    }
    if (unit === 'h') {
      return 60*60*n;
    }
  }

  render(interpolate?) {
    var target = this.target;

    if (target.rawQuery) {
      if (interpolate) {
        return this.templateSrv.replace(target.query, this.scopedVars, this.interpolateQueryStr);
      } else {
        return target.query;
      }
    }

    if (this.hasGroupByTime()) {
      let timeInterval;
      try {
        timeInterval = this.timeIntervalAsSeconds();
      } catch (err) {
        return '';
      }
      return this.renderWithTimeInterval(timeInterval, interpolate);
    }

    // Epoch time in ms
    var query = `SELECT sys.epoch(${TS_COLUMN_NAME})`;
    var i, y;
    for (i = 0; i < this.selectModels.length; i++) {
      let parts = this.selectModels[i];
      var selectText = "";
      for (y = 0; y < parts.length; y++) {
        let part = parts[y];
        selectText = part.render(selectText);
      }

      query += ', ' + selectText;
    }

    query += ' FROM ' + this.getMeasurementAndPolicy(interpolate) + ' WHERE ';
    var conditions = _.map(target.tags, (tag, index) => {
      return this.renderTagCondition(tag, index, interpolate);
    });

    query += conditions.join(' ');
    query += (conditions.length > 0 ? ' AND ' : '') + '$timeFilter';

    var groupBySection = "";
    for (i = 0; i < this.groupByParts.length; i++) {
      var part = this.groupByParts[i];
      if (i > 0) {
        // for some reason fill has no seperator
        groupBySection += part.def.type === 'fill' ? ' ' : ', ';
      }
      groupBySection += part.render('');
    }

    if (groupBySection.length) {
      query += ' GROUP BY ' + groupBySection;
    }

    if (target.fill) {
      query += ' fill(' + target.fill + ')';
    }

    if (target.orderByTime === 'DESC') {
      query += ` ORDER BY ${TS_COLUMN_NAME} DESC`;
    }

    if (target.limit || target.maxDataPoints) {
      query += ' LIMIT ' + (target.limit || target.maxDataPoints);
    }

    if (target.slimit) {
      query += ' SLIMIT ' + target.slimit;
    }

    return query;
  }

  renderAdhocFilters(filters) {
    var conditions = _.map(filters, (tag, index) => {
      return this.renderTagCondition(tag, index, false);
    });
    return conditions.join(' ');
  }
}
