const request = require('request-promise')
const azure = require('azure-storage')
const TABLENAME = 'prices'

module.exports = function (context, timer) {
  const timestamp = new Date()
  const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,SC,LTC,ETC,XMR,XRP&tsyms=BTC,EUR,USD'
  const tableService = azure.createTableService(process.env.AzureWebJobsStorage)
  request(url)
    .then(data => {
      data = JSON.parse(data)
      Object.keys(data).forEach(coin => {
        const entry = {
          PartitionKey: coin,
          RowKey: timestamp.toISOString(),
          timeRecorded: timestamp
        }
        Object.keys(data[coin]).forEach(curr => {
          entry[curr] = data[coin][curr]
        })
        tableService.insertEntity(TABLENAME, entry, function (error, result, response) {
          if (error) {
            context.log(error)
            context.done(error)
          }
        })
      })
      context.done(null, data)
    })
    .catch(e => context.done(e))
}
