import { MonetQueryCtrl } from '../query_ctrl';

describe('MonetQueryCtrl', () => {
    let ctx = {
        $q:null,
        scope:null,
        panelCtrl: null,
        target: null,
        ctrl: null,
        uiSegmentSrv: {}
    };
    beforeEach(inject(($rootScope, $controller, $q) => {
        ctx.$q = $q;
        ctx.scope = $rootScope.$new();
        // ctx.datasource.metricFindQuery = sinon.stub().returns(ctx.$q.when([]));
        ctx.panelCtrl = { panel: {} };
        // ctx.panelCtrl.refresh = sinon.spy();
        ctx.target = { target: {} };
        ctx.ctrl = $controller(MonetQueryCtrl, { $scope: ctx.scope, uiSegmentSrv: ctx.uiSegmentSrv }, {
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
