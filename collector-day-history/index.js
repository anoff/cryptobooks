#!/usr/bin/env node
const request = require('request-promise')
const azure = require('azure-storage')
const PromisePool = require('es6-promise-pool')
const TABLENAME = 'prices'
const CONCURRENCY = 10

const fiats = ['EUR', 'BTC', 'USD']
const coins = ['ETH', 'BTC', 'SC', 'LTC', 'ETC', 'XMR', 'XRP']

module.exports = function (context, req) {
  const tableService = azure.createTableService()
  Promise.all(coins.map(coin => {
    return Promise.all(fiats.map(fiat => {
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
        if (e.coin === 'BTC') {
          obj.BTC = 1
        }
        return obj
      })
      .filter(e => e[fiats[0]] > 0) // filter elements where currency does not report valid price

      return entries
    })
  }))
  .then(p => {
    return [].concat.apply([], p)
    .map(entry => {
      return () => new Promise((resolve, reject) => tableService.insertEntity(TABLENAME, entry, function (error, result, response) {
        if (error) {
          context.log(error)
          reject(error)
        }
        resolve(result)
      }))
    })
  })
  .then(promises => {
    context.log(`Constructing generator for ${promises.length} db inserts`)
    const gen = function * () {
      while (promises.length) {
        yield promises.splice(0, 1)[0]()
      }
    }
    return new PromisePool(gen(), CONCURRENCY)
  })
  .then(pool => {
    context.log('START inserting..')
    pool.start()
    .then(() => {
      context.log('DONE.')
      context.done()
    })
  })
}

// use 'EXEC_LOCAL = TRUE node index.js' to run locally
process.env.EXEC_LOCAL && module.exports({log: console.log, done: process.exit, bindings: {tableBinding: null}})
