const pkg = require('yahoo-finance2');
console.log('Exports:', Object.keys(pkg));
console.log('Default:', pkg.default);

async function test() {
    try {
        // Try instantiation
        const YahooFinance = pkg.default || pkg;
        const yf = new YahooFinance();
        console.log('Instantiated:', yf);

        const result = await yf.historical('SPY', {
            period1: '2023-01-01',
            interval: '1d'
        });
        console.log('Success!');
        console.log('First item:', result[0]);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
