const request = require('request-promise')

module.exports = function (context, timer) {
  const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,SC,LTC,ETC,XMR,XRP&tsyms=BTC,EUR,USD'
  context.bindings.tableBinding = []
  request(url)
    .then(data => {
      data = JSON.parse(data)
      const entry = {
        PartitionKey: 'test',
        RowKey: Date.now()
      }
      Object.keys(data).forEach(key => {
        entry[key] = data[key]
      })
      context.bindings.tableBinding.push(entry)
      context.done(null, data)
    })
}
