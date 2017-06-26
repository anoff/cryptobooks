const request = require('request-promise')

module.exports = function (context, timer) {
  const timestamp = new Date()
  const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,SC,LTC,ETC,XMR,XRP&tsyms=BTC,EUR,USD'
  context.bindings.tableBinding = []
  request(url)
    .then(data => {
      data = JSON.parse(data)
      Object.keys(data).forEach(coin => {
        const entry = {
          PartitionKey: coin,
          RowKey: timestamp.valueOf(),
          timeRecorded: timestamp.toISOString()
        }
        Object.keys(data[coin]).forEach(curr => {
          entry[curr] = data[coin][curr]
        })
        context.bindings.tableBinding.push(entry)
      })
      context.done(null, data)
    })
    .catch(e => context.done(e))
}
