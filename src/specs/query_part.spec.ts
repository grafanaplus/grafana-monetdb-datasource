import queryPart from '../query_part';

describe('MonetQueryPart', () => {
    describe('series with mesurement only', () => {
        it('should handle alias parts', () => {
            let part = queryPart.create({
                type: 'alias',
                params: ['test'],
            });

            expect(part.text).toBe('alias(test)');
            expect(part.render('mean(value)')).toBe('mean(value) AS "test"');
        });

        it('should handle filed parts', () => {
            let part = queryPart.create({
                type: 'field',
                params: ['cpu'],
            });
            let partText = part.text;
            let rendered = part.render();
            expect(partText).toBe('field(cpu)');
            expect(rendered).toBe('cpu');
        });

        it('should handle count parts', () => {
            let part = queryPart.create({
                type: 'count',
            });
            let partText = part.text;
            let rendered = part.render('cpu');
            expect(partText).toBe('count()');
            expect(rendered).toBe('count(cpu)');
        });

        it('should handle stddev parts', () => {
            let part = queryPart.create({
                type: 'stddev',
            });
            let partText = part.text;
            let rendered = part.render('cpu');
            expect(partText).toBe('stddev()');
            expect(rendered).toBe('stddev(cpu)');
        });
    });
});

