const request = require('request-promise')

const fiats = ['EUR', 'BTC', 'USD']
const coins = ['ETH']//, 'BTC', 'SC', 'LTC', 'ETC', 'XMR', 'XRP']

module.exports = function (context, timer) {
  context.bindings.tableBinding = []
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
      const master = arr.splice(0, 1)[0]
      const seconds = arr.reduce((p, c) => p.concat(c), [])
      const entries = master.map(e => {
        const obj = {
          PartitionKey: e.coin,
          RowKey: e.date.toISOString(),
          timeRecorded: e.date,
          historic: true
        }
        obj[e.fiat] = e.price
        // append other exchange rates here
        seconds
        .filter(o => o.date.valueOf() === e.date.valueOf())
        .forEach(o => {
          obj[o.fiat] = o.price
        })
        return obj
      })
      .filter(e => e[fiats[0]] > 0) // filter elements where currency does not report valid price
      context.bindings.tableBinding = context.bindings.tableBinding.concat(entries)
    })
  })
}

// use 'EXEC_LOCAL = TRUE node index.js' to run locally
process.env.EXEC_LOCAL && module.exports({log: console.log, done: process.exit})
