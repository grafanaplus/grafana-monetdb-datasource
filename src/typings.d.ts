// dummy modules
declare module 'app/plugins/sdk' {
    export class QueryCtrl {
    target: any;
    datasource: any;
    panelCtrl: any;
    panel: any;
    hasRawMode: boolean;
    error: string;
    constructor($scope, $injector);
    refresh: Function;
    }
}

declare module 'moment' {
  var moment: any;
  export default moment;
}


