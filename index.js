const {fromZonedTime, toZonedTime} = require('date-fns-tz');
const jsonata = require('jsonata');
const jsonDiff = require('json-diff');
const fs = require('fs');

const toTimestampInSecondsFromIsoDateTime = (datetime, timezone) => {
    const date = new Date(datetime);
    const utcDate = fromZonedTime(date, timezone ?? 'Europe/Berlin');

    return Math.round(utcDate.getTime() / 1000);
}

(async () => {

    const expected = fs.readFileSync('tests.json', 'utf8');
    const cases = JSON.parse(expected);

    for (const c of cases['data']) {
        const expression = jsonata(c['rule']);

        expression.registerFunction(
            'toTimestampInSecondsFromIsoDateTime',
            toTimestampInSecondsFromIsoDateTime,
            '<s:n>',
        );

        for (const d of c['test']) {

            const result = await expression.evaluate({payloads: [d['raw']]});

            console.log('Diff:')
            console.log(jsonDiff.diffString(result.payloads[0], d['canonical']));

            console.log('----------------------')
            console.log('Result:')
            //print json pretty
            console.log(JSON.stringify(result.payloads[0], null, 2));

            console.log('----------------------')
            console.log('Expected:')
            console.log(JSON.stringify(d['canonical'], null, 2));
        }
    }
})()