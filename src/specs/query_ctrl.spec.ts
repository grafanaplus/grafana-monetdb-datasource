import angular from 'angular';
import { MonetQueryCtrl } from '../query_ctrl';
import helpers from 'test/specs/helpers';

describe('MonetQueryCtrl', () => {
    let ctx = new helpers.ControllerTestContext();

    beforeEach(angular.mock.module(function ($compileProvider) {
        $compileProvider.preAssignBindingsEnabled(true);
    }));

    beforeEach(angular.mock.module(($provide) => {
        // mock injected service
        $provide.service('templateSrv', () => { });
        $provide.service('uiSegmentSrv', () => {
            return jasmine.createSpyObj('uiSegmentSrvSpy', ['newPlusButton', 'newSegment', 'newSelectMeasurement']);
        });
    }));

    beforeEach(inject(($rootScope, $controller, $q) => {
        ctx.$q = $q;
        ctx.scope = $rootScope.$new();
        ctx.datasource.metricFindQuery = sinon.stub().returns(ctx.$q.when([]));
        // ctx.datasource = jasmine.createSpyObj('datasource', ['metricFindQuery']);
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
        it('should be defined', () => {
            expect(ctx.ctrl).toBeDefined();
        });
    });

});
