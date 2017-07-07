const request = require('request-promise')
const azure = require('azure-storage')
const TABLENAME = 'prices'
const INTERVAL = 5 * 60 // interval the function is running [s]

module.exports = function (context, timer) {
  const timestamp = new Date()
  const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,SC,LTC,ETC,XMR,XRP&tsyms=BTC,EUR,USD'
  const tableService = azure.createTableService(process.env.AzureWebJobsStorage)

  function addEntry(entry) {
    return tableService.insertEntity(TABLENAME, entry, function (error, result, response) {
      if (error) {
        context.log(error)
        context.done(error)
      }
    })
  }
  request(url)
    .then(data => {
      data = JSON.parse(data)
      Object.keys(data).forEach(coin => {
        const entry = {
          PartitionKey: coin,
          RowKey: timestamp.toISOString()
        }
        Object.keys(data[coin]).forEach(curr => {
          entry[curr] = data[coin][curr]
        })
        // add additional entry if hour is passed
        if (timestamp.getMinutes() * 60 + timestamp.getSeconds() <= INTERVAL) {
          entry.hourly = true
          // add another entry every day
          if (timestamp.getHours() === 0) {
            entry.daily = true
          }
        }
        addEntry(entry)
      })
      context.done(null, data)
    })
    .catch(e => context.done(e))
}