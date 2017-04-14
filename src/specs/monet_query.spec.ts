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

    describe('render series with alias', function () {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                select: [
                    [
                        { type: 'field', params: ['value'] },
                        { type: 'mean', params: [] },
                        { type: 'alias', params: ['text'] },
                    ]
                ]
            }, templateSrv, {});

            var queryText = query.render();
            expect(queryText).toBe('SELECT mean(value) AS text FROM cpu WHERE $timeFilter');
        });
    });

    describe('series with multiple tags only', function () {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                groupBy: [{ type: 'field', params: ['hostname'] }],
                tags: [{ key: 'hostname', value: 'server1' }, { key: 'app', value: 'email', condition: "AND" }]
            }, templateSrv, {});

            var queryText = query.render();
            expect(queryText).toBe('SELECT mean(value) FROM cpu WHERE hostname = \'server1\' AND app = \'email\' AND ' +
                '$timeFilter GROUP BY hostname');
        });
    });

    describe('series with tags OR condition', function () {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                groupBy: [{ type: 'field', params: ['hostname'] }],
                tags: [{ key: 'hostname', value: 'server1' }, { key: 'hostname', value: 'server2', condition: "OR" }]
            }, templateSrv, {});

            var queryText = query.render();
            expect(queryText).toBe('SELECT mean(value) FROM cpu WHERE hostname = \'server1\' OR hostname = \'server2\' AND ' +
                '$timeFilter GROUP BY hostname');
        });
    });

    describe('query with value condition', function () {
        it('should not quote value', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                groupBy: [],
                tags: [{ key: 'value', value: '5', operator: '>' }]
            }, templateSrv, {});

            var queryText = query.render();
            expect(queryText).toBe('SELECT mean(value) FROM cpu WHERE value > 5 AND $timeFilter');
        });
    });

    describe('series with groupByTag', function () {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                tags: [],
                groupBy: [{ type: 'tag', params: ['host'] }],
            }, templateSrv, {});

            var queryText = query.render();
            expect(queryText).toBe('SELECT mean(value) FROM cpu WHERE $timeFilter ' +
                'GROUP BY host');
        });
    });

    describe('render series without group by', function () {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                select: [[{ type: 'field', params: ['value'] }]],
                groupBy: [],
            }, templateSrv, {});
            var queryText = query.render();
            expect(queryText).toBe('SELECT value FROM cpu WHERE $timeFilter');
        });
    });

    describe('when adding group by part', function () {

        it('should add tag correctly', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                groupBy: [{ type: 'tag', params: ['host'] }, { type: 'tag', params: ['os'] }],
            }, templateSrv, {});

            query.addGroupBy('tag(region)');
            expect(query.target.groupBy.length).toBe(3);
            expect(query.target.groupBy[1].type).toBe('tag');
            expect(query.target.groupBy[1].params[0]).toBe('os');
            expect(query.target.groupBy[2].type).toBe('tag');
        });

        it('should add tag last if no fill', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                groupBy: []
            }, templateSrv, {});

            query.addGroupBy('tag(host)');
            expect(query.target.groupBy.length).toBe(1);
            expect(query.target.groupBy[0].type).toBe('tag');
        });

    });

    describe('when adding select part', function () {

        it('should add mean after field', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                select: [[{ type: 'field', params: ['value'] }]]
            }, templateSrv, {});

            query.addSelectPart(query.selectModels[0], 'mean');
            expect(query.target.select[0].length).toBe(2);
            expect(query.target.select[0][1].type).toBe('mean');
        });

        it('should replace sum by mean', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                select: [[{ type: 'field', params: ['value'] }, { type: 'mean' }]]
            }, templateSrv, {});

            query.addSelectPart(query.selectModels[0], 'sum');
            expect(query.target.select[0].length).toBe(2);
            expect(query.target.select[0][1].type).toBe('sum');
        });

        it('should add max before alias', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                select: [[{ type: 'field', params: ['value'] }, { type: 'mean' }, { type: 'alias' }]]
            }, templateSrv, {});

            query.addSelectPart(query.selectModels[0], 'max');
            expect(query.target.select[0].length).toBe(3);
            expect(query.target.select[0][2].type).toBe('alias');
        });

        it('should add sum last', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                select: [[{ type: 'field', params: ['value'] }, { type: 'sum' }]]
            }, templateSrv, {});

            query.addSelectPart(query.selectModels[0], 'sum');
            expect(query.target.select[0].length).toBe(2);
            expect(query.target.select[0][1].type).toBe('sum');
        });

        // describe('when render adhoc filters', function () {
        //     it('should generate correct query segment', function () {
        //         var query = new InfluxQuery({ measurement: 'cpu', }, templateSrv, {});

        //         var queryText = query.renderAdhocFilters([
        //             { key: 'key1', operator: '=', value: 'value1' },
        //             { key: 'key2', operator: '!=', value: 'value2' },
        //         ]);

        //         expect(queryText).to.be('"key1" = \'value1\' AND "key2" != \'value2\'');
        //     });
        // });

    });

});

