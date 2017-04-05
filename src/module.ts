import  MonetDataSource  from './datasource';
import { MonetQueryCtrl } from './query_ctrl';

class MonetConfigCtrl {
  static templateUrl = 'partials/config.html';
}

class MonetQueryOptionsCtrl {
  static templateUrl = 'partials/query.options.html';
}

class MonetAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export {
  MonetDataSource as Datasource,
  MonetQueryCtrl as QueryCtrl,
  MonetConfigCtrl as ConfigCtrl,
  MonetQueryOptionsCtrl as QueryOptionsCtrl,
  MonetAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};