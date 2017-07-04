#!/usr/bin/env node
const request = require('request-promise')
const azure = require('azure-storage')
const TABLENAME = 'prices'

const fiats = ['EUR', 'BTC', 'USD']
const coins = ['ETH', 'XMR']//, 'BTC', 'SC', 'LTC', 'ETC', 'XMR', 'XRP']

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
  // merge requests for different fiat currencies of one coin into one object
  .then(arr => {
    const master = arr.splice(0, 1)[0]
    const seconds = arr.reduce((p, c) => p.concat(c), [])
    const entries = master.map(e => {
      const obj = {
        PartitionKey: {_: e.coin, $: 'Edm.String'},
        RowKey: {_: e.date.toISOString(), $: 'Edm.String'},
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
// merge all coin arrays into one
.then(arr => {
  arr = [].concat.apply([], arr)
  return arr
})
// create batches for insert
.then(entries => {
  const tableBatches = []
  let last = null
  entries.forEach((entry, ix) => {
    if (ix === 0 || tableBatches[0].size === 100 || entry.PartitionKey._ !== last.PartitionKey._) {
      tableBatches.unshift(new azure.TableBatch())
    }
    tableBatches[0].insertEntity(entry)
    last = entry
  })
  return tableBatches
})
.then(tableBatches => {
  const next = batches => {
    if (batches.length) {
      console.log(`..executing next batch, ${batches.length} left`)
      // take next batch if one exists
      const batch = batches.splice(0, 1)[0]
      tableService.executeBatch(TABLENAME, batch, (err, result, resonse) => {
        if (err) {
          console.error(err)
          process.exit(err)
        } else {
          next(batches)
        }
      })
    } else {
      // otherwise terminate program
      console.log('DONE')
      process.exit()
    }
  }
  next(tableBatches)
})
