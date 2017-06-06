import MonetSeries from '../monet_series';
import { TS_COLUMN_NAME } from '../constants';

describe('When generating Grafana data from MonetDB quesry response,', () => {

    describe('given annotation repsponse', () => {
        let serie = {
            values: [
                [1451607290, 100]
            ]
        };
        let option = {
            annotation: {
                tagsColumn: 'datacenter,source',
                titleColumn: "",
                textColumn: 'text'
            },
        };
        let ms = new MonetSeries(serie, option);

        it('should handle tags correctly', () => {
            let anotations = ms.getAnnotations();
            expect(anotations[0].tags.length).toBe(2);
        });

        it('should substitue title with the value when no title', () => {
            let anotations = ms.getAnnotations();
            expect(anotations[0].title).toBe(100);
        });

    });
});
