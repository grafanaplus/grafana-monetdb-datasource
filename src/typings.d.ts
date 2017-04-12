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

declare module 'app/core/components/query_part/query_part' {
  export class QueryPartDef {
    type: string;
    params: any[];
    defaultParams: any[];
    renderer: any;
    category: any;
    addStrategy: any;
    constructor(options: any);
  }

  export class QueryPart {
    constructor(part: any, def: any);
  }

  export function functionRenderer(part, innerExpr);
  export function suffixRenderer(part, innerExpr);
  export function identityRenderer(part, innerExpr);
  export function quotedIdentityRenderer(part, innerExpr);
}


declare module 'app/core/utils/datemath' {
  export function parse(text, roundUp);
}

