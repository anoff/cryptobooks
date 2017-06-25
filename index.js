const request = require('request-promise')
const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,SC,LTC,ETC,XMR,XRP&tsyms=BTC,EUR,USD'

request(url)
.then(console.log.bind(console))
