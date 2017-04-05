
import angular from 'angular';
// import _ from 'lodash';

// mport * as dateMath from 'app/core/utils/datemath';


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
    // this.urls = _.map(instanceSettings.url.split(','), function(url) {
    //   return url.trim();
    // });

    this.username = instanceSettings.username;
    this.password = instanceSettings.password;
    this.name = instanceSettings.name;
    this.database = instanceSettings.database;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    this.interval = (instanceSettings.jsonData || {}).timeInterval;
    this.supportAnnotations = true;
    this.supportMetrics = true;
     // this.responseParser = new ResponseParser();
  }

  query(options) {
    // TODO 
  };

  annotationQuery(options) {
    // TODO 
  };


  metricFindQuery(query) {
    // TODO
  }

  testDatasource() {
    // TODO
  }

}

