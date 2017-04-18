import angular from 'angular';
import _ from 'lodash';
import * as dateMath from 'app/core/utils/datemath';
import ResponseParser from './response_parser';
import MonetQuery from './monet_query';
import MonetSeries from './monet_series';

export default class MonetDatasource {
  type: string;
  urls: any;
  username: string;
  password: string;
  name: string;
  database: any;
  basicAuth: any;
  withCredentials: any;
  interval: any;
  supportAnnotations: boolean;
  supportMetrics: boolean;
  responseParser: any;

  /** @ngInject */
  constructor(instanceSettings, private $q, private backendSrv, private templateSrv) {
    this.type = 'monetdb';
    this.urls = _.map(instanceSettings.url.split(','), function(url: string) {
      return url.trim();
    });

    this.username = instanceSettings.username;
    this.password = instanceSettings.password;
    this.name = instanceSettings.name;
    this.database = instanceSettings.database;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    this.interval = (instanceSettings.jsonData || {}).timeInterval;
    this.supportAnnotations = true;
    this.supportMetrics = true;
    this.responseParser = new ResponseParser();
  }

  query(options) {
    let timeFilter = this.getTimeFilter(options);
    let scopedVars = options.scopedVars;
    let targets = _.cloneDeep(options.targets);
    let queryTargets = [];
    let queryModel;
    let i, y;

    let allQueries = _.map(targets, target => {
      if ((target as any).hide) { return ""; }

      queryTargets.push(target);

      // backward compatability
      scopedVars.interval = scopedVars.__interval;

      queryModel = new MonetQuery(target, this.templateSrv, scopedVars);
      return queryModel.render(true);

    }).reduce((acc, current) => {
      if (current !== "") {
        acc += ";" + current;
      }
      return acc;
    });

    if (allQueries === '') {
      return this.$q.when({data: []});
    }

    // add global adhoc filters to timeFilter
    let adhocFilters = this.templateSrv.getAdhocFilters(this.name);
    if (adhocFilters.length > 0 ) {
      timeFilter += ' AND ' + queryModel.renderAdhocFilters(adhocFilters);
    }

    // replace grafana variables
    scopedVars.timeFilter = {value: timeFilter};

    // replace templated variables
    allQueries = this.templateSrv.replace(allQueries, scopedVars);

    return this._seriesQuery(allQueries).then((data): any => {
      if (!data || !data.results) {
        return [];
      }

      let seriesList = [];

      for (i = 0; i < data.results.length; i++) {
        let result = data.results[i];
        if (!result || !result.series) { continue; }

        let target = queryTargets[i];
        let alias = target.alias;
        if (alias) {
          alias = this.templateSrv.replace(target.alias, options.scopedVars);
        }

        let monetSeries = new MonetSeries({ series: data.results[i].series, alias: alias });

        switch (target.resultFormat) {
          case 'table': {
            seriesList.push(monetSeries.getTable());
            break;
          }
          default: {
            let timeSeries = monetSeries.getTimeSeries();
            for (y = 0; y < timeSeries.length; y++) {
              seriesList.push(timeSeries[y]);
            }
            break;
          }
        }
      }

      return {data: seriesList};
    });
  };

  annotationQuery(options) {
    // TODO 
  };


  metricFindQuery(query): Promise<any> {
    let interpolated = this.templateSrv.replace(query, null, 'regex');

    return this._seriesQuery(interpolated)
      .then(_.curry(this.responseParser.parse)(query));
  }


  _seriesQuery(query) {
    if (!query) { return this.$q.when({results: []}); }

    return this._monetRequest('GET', '/query', {q: query, epoch: 'ms'});
  }

  serializeParams(params) {
    if (!params) { return '';}

    return _.reduce(params, (memo, value: string, key) => {
      if (value === null || value === undefined) { return memo; }
      memo.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      return memo;
    }, []).join("&");
  }

  testDatasource() {
    let testQuery = 'select name from tables where schema_id=(select id as id from schemas where name="timetrails");';
    return this.metricFindQuery(testQuery).then(() => {
      return { status: "success", message: "Data source is working", title: "Success" };
    });
  }

  _monetRequest(method, url, data) {
    let self = this;

    let currentUrl = self.urls.shift();
    self.urls.push(currentUrl);

    let params: any = {
      u: self.username,
      p: self.password,
    };

    if (self.database) {
      params.db = self.database;
    }

    if (method === 'GET') {
      _.extend(params, data);
      data = null;
    }

    let options: any = {
      method: method,
      url:    currentUrl + url,
      params: params,
      data:   data,
      precision: "ms",
      inspect: { type: 'monetdb' },
      paramSerializer: this.serializeParams,
    };

    options.headers = options.headers || {};
    if (this.basicAuth || this.withCredentials) {
      options.withCredentials = true;
    }
    if (self.basicAuth) {
      options.headers.Authorization = self.basicAuth;
    }

    return this.backendSrv.datasourceRequest(options).then(result => {
      return result.data;
    }, function(err) {
      if (err.status !== 0 || err.status >= 300) {
        if (err.data && err.data.error) {
          throw { message: 'Monet Error Response: ' + err.data.error, data: err.data, config: err.config };
        } else {
          throw { message: 'Monet Error: ' + err.message, data: err.data, config: err.config };
        }
      }
    });
  };

  getTimeFilter(options) {
    let from = this.getMonetTime(options.rangeRaw.from, false);
    let until = this.getMonetTime(options.rangeRaw.to, true);
    let fromIsAbsolute = from[from.length-1] === 'ms';

    if (until === 'now()' && !fromIsAbsolute) {
      return 'time > ' + from;
    }

    return 'time > ' + from + ' and time < ' + until;
  }

  getMonetTime(date, roundUp) {
    // TODO implement Monet specfic time implementation
    if (_.isString(date)) {
      if (date === 'now') {
        return 'now';
      }

      let parts = /^now-(\d+)([d|h|m|s])$/.exec(date);
      if (parts) {
        let amount = parseInt(parts[1]);
        let unit = parts[2];
        switch (parts[2]) {
          case 'd': unit = 'day'; break;
          case 'h': unit = 'hour'; break;
          case 'm': unit = 'minute'; break;
          case 's': unit = 'second'; break;
          default: break;
        }
        return 'now - interval ' + '"' + amount + '"' + ' ' + unit;
      }
      date = dateMath.parse(date, roundUp);
    }

    return date.valueOf() + 'ms';
  }

}

