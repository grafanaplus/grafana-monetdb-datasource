export default class ResponseParser {
    parse(query, data) {
        if (!data || data.results.length === 0) { return []; }
        // TODO implement monetdb specific parser
        let values = [];
        
        for(let result of data.results) {
            values = values.concat(result.series.values);
        }

        let segments = values.map(v => {
            return {
                text: v[0]
            }
        });
        return segments;
    }
}
