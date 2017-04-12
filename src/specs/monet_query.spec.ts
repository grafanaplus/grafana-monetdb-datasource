import MonetQuery from '../monet_query';

describe('Monet Query', () => {
    var templateSrv = { replace: val => val };

    describe('render series with mesurement only', () => {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
            }, templateSrv, {});

            let queryText = query.render();
            expect(queryText).toBe('SELECT mean("value") FROM "cpu" WHERE $timeFilter GROUP BY time($__interval) fill(null)');
        });
    });
});

