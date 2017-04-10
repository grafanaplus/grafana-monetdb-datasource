import angular from 'angular';
import { MonetQueryCtrl } from '../query_ctrl';

describe('MonetQueryCtrl', () => {
     let ctx = {
            $q: null,
            scope: null,
            panelCtrl: null,
            target: null,
            ctrl: null,
        };
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
        // ctx.datasource.metricFindQuery = sinon.stub().returns(ctx.$q.when([]));
        ctx.panelCtrl = { panel: {} };
        ctx.panelCtrl.refresh = jasmine.createSpy('refresh');
        ctx.target = { target: {} };
        ctx.ctrl = $controller(MonetQueryCtrl, { $scope: ctx.scope }, {
            panelCtrl: ctx.panelCtrl,
            target: ctx.target,
        });

    }));

    describe('init', () => {
        it('should be defined', () => {
            expect(ctx.ctrl).toBeDefined();
        });
    });

});
