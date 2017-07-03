const request = require('request-promise')
const azure = require('azure-storage')
const TABLENAME = 'prices'

const fiats = ['EUR', 'BTC', 'USD']
const coins = ['BTC']//, 'ETH', 'SC', 'LTC', 'ETC', 'XMR', 'XRP']

module.exports = function (context, timer) {
  const timestamp = new Date()
  //const tableService = azure.createTableService(process.env.AzureWebJobsStorage)
  coins.forEach(coin => {
    Promise.all(fiats.map(fiat => {
      const url = `https://min-api.cryptocompare.com/data/histoday?fsym=${coin}&tsym=${fiat}&limit=2000`
      return request(url)
      .then(res => {
        res = JSON.parse(res)
        const data = res.Data
        return data.map(e => {
          return {
            date: new Date((e.time) * 1000),
            fiat,
            coin,
            price: e.close
          }
        })
      })
    }))
    .then(arr => {
      const results = arr.reduce((p, c) => p.concat(c), [])
      context.log(results)
      // TODO reduce to one line and add to tableoutpu
    })
  })
}

// use 'EXEC_LOCAL = TRUE node index.js' to run locally
process.env.EXEC_LOCAL && module.exports({log: console.log, done: process.exit})
