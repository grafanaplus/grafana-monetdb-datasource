import angular from 'angular';
import { MonetQueryCtrl } from '../query_ctrl';

interface ICtx {
    $q: any;
    scope: any;
    panelCtrl: any;
    target: any;
    ctrl: any;
    datasource: {
        metricFindQuery()
    }
}
describe('MonetQueryCtrl', () => {
    let ctx: ICtx;
   
    beforeEach(angular.mock.module(function($compileProvider) {
        $compileProvider.preAssignBindingsEnabled(true);
    }));

    beforeEach(angular.mock.module(($provide) => {
        // mock injected service
        $provide.service('templateSrv', () => {});
        $provide.service('uiSegmentSrv', () => {});
    }));

    beforeEach(inject(($rootScope, $controller, $q) => {
        ctx.$q = $q;
        ctx.scope = $rootScope.$new();
        //ctx.datasource.metricFindQuery = sinon.stub().returns(ctx.$q.when([]));
        ctx.datasource = jasmine.createSpyObj('datasource', ['metricFindQuery']);
        //spyOn(ctx.datasource, 'metricFindQuery').and.returnValue(ctx.$q.when([]));
        ctx.panelCtrl = { panel: {} };
        ctx.panelCtrl.refresh = jasmine.createSpy('refresh');
        ctx.target = { target: {} };
        ctx.ctrl = $controller(MonetQueryCtrl, { $scope: ctx.scope }, {
            panelCtrl: ctx.panelCtrl,
            target: ctx.target,
            datasource: ctx.datasource
        });

    }));

    describe('init', () => {
        // it('should be defined', () => {
        //     expect(ctx.ctrl).toBeDefined();
        // });
    });

});
