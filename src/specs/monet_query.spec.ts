import MonetQuery from '../monet_query';

describe('Monet Query', () => {
    var templateSrv = { replace: val => val };

    describe('render series with mesurement only', () => {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
            }, templateSrv, {});

            let queryText = query.render();
            expect(queryText).toBe('SELECT mean(value) FROM cpu WHERE $timeFilter');
        });
    });

    describe('render series with policy only', function () {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                policy: '5m_avg'
            }, templateSrv, {});

            var queryText = query.render();
            expect(queryText).toBe('SELECT mean(value) FROM 5m_avg.cpu WHERE $timeFilter');
        });
    });
});

