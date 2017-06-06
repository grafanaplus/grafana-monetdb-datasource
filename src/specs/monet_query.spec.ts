import MonetQuery from '../monet_query';
import { QueryEditorError } from '../error';
import { TS_COLUMN_NAME } from '../constants';

describe('Monet Query', () => {
    var templateSrv = { replace: val => val };

    // describe('render series with mesurement only', () => {
    //     it('should generate correct query', function () {
    //         var query = new MonetQuery({
    //             measurement: 'cpu',
    //         }, templateSrv, {});

    //         let queryText = query.render();
    //         expect(queryText).toBe(`SELECT sys.epoch(${TS_COLUMN_NAME}), value FROM timetrails.cpu WHERE $timeFilter`);
    //     });
    // });

    // describe('render series with policy only', function () {
    //     it('should generate correct query', function () {
    //         var query = new MonetQuery({
    //             measurement: 'cpu',
    //             policy: '5m_avg'
    //         }, templateSrv, {});

    //         var queryText = query.render();
    //         expect(queryText).toBe(`SELECT sys.epoch(${TS_COLUMN_NAME}), value FROM 5m_avg.cpu WHERE $timeFilter`);
    //     });
    // });

    describe('render series with alias', function () {
        // it('should generate correct query', function () {
        //     var query = new MonetQuery({
        //         measurement: 'cpu',
        //         select: [
        //             [
        //                 { type: 'field', params: ['value'] },
        //                 { type: 'alias', params: ['text'] },
        //             ]
        //         ]
        //     }, templateSrv, {});

        //     var queryText = query.render();
        //     expect(queryText).toBe(`SELECT sys.epoch(${TS_COLUMN_NAME}), value AS text FROM timetrails.cpu WHERE $timeFilter`);
        // });
    });

    describe('when series with multiple tags conditions', function () {
        it('should render AND conditions', () => {
            let query = new MonetQuery({
                measurement: 'cpu',
                groupBy: [],
                tags: [{ key: 'hostname', value: 'server1' }, { key: 'app', value: 'email', condition: "AND" }]
            }, templateSrv, {});
            expect(query.renderWhereConditions()).toBe('hostname = \'server1\' AND app = \'email\' AND $timeFilter');
        });

        it('should render OR conditions', () => {
            let query = new MonetQuery({
                measurement: 'cpu',
                groupBy: [],
                tags: [{ key: 'hostname', value: 'server1' }, { key: 'app', value: 'email', condition: "OR" }]
            }, templateSrv, {});
            expect(query.renderWhereConditions()).toBe('hostname = \'server1\' OR app = \'email\' AND $timeFilter');
        });

        // it('should generate correct query', function () {
        //     var query = new MonetQuery({
        //         measurement: 'cpu',
        //         groupBy: [{ type: 'field', params: ['hostname'] }],
        //         tags: [{ key: 'hostname', value: 'server1' }, { key: 'app', value: 'email', condition: "AND" }]
        //     }, templateSrv, {});

        //     var queryText = query.render();
        //     expect(queryText).toBe(`SELECT sys.epoch(${TS_COLUMN_NAME}), value FROM timetrails.cpu WHERE hostname = \'server1\' AND app = \'email\' AND ` +
        //         '$timeFilter GROUP BY hostname');
        // });
    });

    // describe('series with tags OR condition', function () {
    //     it('should generate correct query', function () {
    //         var query = new MonetQuery({
    //             measurement: 'cpu',
    //             groupBy: [{ type: 'field', params: ['hostname'] }],
    //             tags: [{ key: 'hostname', value: 'server1' }, { key: 'hostname', value: 'server2', condition: "OR" }]
    //         }, templateSrv, {});

    //         var queryText = query.render();
    //         expect(queryText).toBe(`SELECT sys.epoch(${TS_COLUMN_NAME}), value FROM timetrails.cpu WHERE hostname = \'server1\' OR hostname = \'server2\' AND ` +
    //             '$timeFilter GROUP BY hostname');
    //     });
    // });

    describe('query with value condition', function () {
        // it('should not quote value', function () {
        //     var query = new MonetQuery({
        //         measurement: 'cpu',
        //         groupBy: [],
        //         tags: [{ key: 'value', value: '5', operator: '>' }]
        //     }, templateSrv, {});

        //     var queryText = query.render();
        //     expect(queryText).toBe(`SELECT sys.epoch(${TS_COLUMN_NAME}), value FROM timetrails.cpu WHERE value > 5 AND $timeFilter`);
        // });
    });

    describe('when render series without GROUP BY', function () {
        it('should generate correct query', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                select: [[{ type: 'field', params: ['value'] }]],
                groupBy: [],
            }, templateSrv, {});
            var queryText = query.render();
            expect(queryText).toBe(`SELECT sys.epoch(${TS_COLUMN_NAME}), value FROM timetrails.cpu WHERE $timeFilter`);
        });
    });

    describe('when render series with GROUP BY', function () {

        it('should render GROUP BY without time part', () => {
            let query = new MonetQuery({
                measurement: 'cpu',
                groupBy: [{ type: 'time', params: [] }, { type: 'tag', params: ['host'] }, { type: 'tag', params: ['os'] }],
            }, templateSrv, {});

            expect(query.renderGroupBy()).toBe('host, os');
        });

        it('should be empty when only group by time is present', () => {
            let query = new MonetQuery({
                measurement: 'cpu',
                groupBy: [{ type: 'time', params: [] }],
            }, templateSrv, {});

            expect(query.renderGroupBy()).toBe('');
        });

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

            query.addSelectPart(query.selectModels[0], 'avg');
            expect(query.target.select[0].length).toBe(2);
            expect(query.target.select[0][1].type).toBe('avg');
        });

        it('should replace sum by mean', function () {
            var query = new MonetQuery({
                measurement: 'cpu',
                select: [[{ type: 'field', params: ['value'] }, { type: 'avg' }]]
            }, templateSrv, {});

            query.addSelectPart(query.selectModels[0], 'sum');
            expect(query.target.select[0].length).toBe(2);
            expect(query.target.select[0][1].type).toBe('sum');
        });

        // it('should add max before alias', function () {
        //     var query = new MonetQuery({
        //         measurement: 'cpu',
        //         select: [[{ type: 'field', params: ['value'] }, { type: 'mean' }, { type: 'alias' }]]
        //     }, templateSrv, {});

        //     query.addSelectPart(query.selectModels[0], 'max');
        //     expect(query.target.select[0].length).toBe(3);
        //     expect(query.target.select[0][2].type).toBe('alias');
        // });

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

    describe('when render select models, ', () => {
        describe('and aggregates ARE NOT present', () => {
            it('should be able to render select field names only', () => {
                let query = new MonetQuery({
                    measurement: 'rooms',
                    select: [
                        [{ type: 'field', params: ['temp'] }, { type: 'avg' }],
                        [{ type: 'field', params: ['humidity'] }, { type: 'avg' }],
                    ]
                }, templateSrv, {});
                expect(query.renderSelectFieldNames()).toBe('temp, humidity');
            });

            it('should render with no aggregates', () => {
                let query = new MonetQuery({
                    measurement: 'rooms',
                    select: [
                        [{ type: 'field', params: ['temp'] }],
                        [{ type: 'field', params: ['humidity'] }],
                    ]
                }, templateSrv, {});
                expect(query.renderSelectFieldExpressions()).toBe('temp, humidity');
            });

        });


        describe('and aggregates ARE present', () => {
            it('should render with two agregates', () => {
                let query = new MonetQuery({
                    measurement: 'rooms',
                    select: [
                        [{ type: 'field', params: ['temp'] }, { type: 'avg' }],
                        [{ type: 'field', params: ['humidity'] }, { type: 'avg' }],
                    ]
                }, templateSrv, {});
                expect(query.renderSelectFieldExpressions()).toBe('avg(temp), avg(humidity)');
            });
            it('should render with one aggregate', () => {
                let query = new MonetQuery({
                    measurement: 'rooms',
                    select: [
                        [{ type: 'field', params: ['temp'] }, { type: 'avg' }],
                        [{ type: 'field', params: ['humidity'] }],
                    ]
                }, templateSrv, {});
                expect(query.renderSelectFieldExpressions()).toBe('avg(temp), humidity');
            });

        });

        describe('when testing timeIntervalAsSeconds', () => {
            it('should parse 15m correctly', () => {
                let query = new MonetQuery({
                    measurement: 'rooms',
                    select: [[{ type: 'field', params: ['temp'] }, { type: 'avg' }]],
                    groupBy: [{ type: 'time', params: ['15m'] }],
                }, templateSrv, {});
               expect(query.timeIntervalAsSeconds()).toBe(15*60);
            });
            it('should handle auto option', () => {
                let query = new MonetQuery({
                    measurement: 'rooms',
                    select: [[{ type: 'field', params: ['temp'] }, { type: 'avg' }]],
                    groupBy: [{ type: 'time', params: ['auto'] }],
                }, templateSrv, {
                        interval: {value: '2m'}
                    });
                expect(query.timeIntervalAsSeconds()).toBe(2*60);
            });
            it('should throw an QueryEditorException', () => {
                let query = new MonetQuery({
                    measurement: 'rooms',
                    select: [[{ type: 'field', params: ['temp'] }, { type: 'avg' }]],
                    groupBy: [{ type: 'time', params: ['15ds'] }],
                }, templateSrv, {});
                expect(query.timeIntervalAsSeconds).toThrow();
            });
        });

        describe('when testing full query text', () => {

            it('should group by time interval', () => {
                let query = new MonetQuery({
                    measurement: 'rooms',
                    select: [[{ type: 'field', params: ['temp'] }, { type: 'avg' }]],
                    groupBy: [{ type: 'time', params: ['15m'] }],
                }, templateSrv, {});
                let interval = 60 * 15;
                let targetQuery = `WITH T(${TS_COLUMN_NAME}, temp, period)
                        AS (SELECT ${TS_COLUMN_NAME}, temp, (sys.epoch(${TS_COLUMN_NAME})/${interval}) as period FROM timetrails.rooms 
                        WHERE $timeFilter) 
                    SELECT cast(avg(sys.epoch(${TS_COLUMN_NAME})) as int), avg(temp) 
                    FROM T 
                    GROUP BY period`;
                let resultQuery = query.renderWithTimeInterval(interval, true);
                expect(resultQuery.replace(/\s/g, '')).toBe(targetQuery.replace(/\s/g, ''));
            });

        });

    });

});

