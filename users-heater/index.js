const https = require('https')

module.exports = function (context, myTimer) {
  var start = new Date()
  return https.get('https://cryptobooks.azurewebsites.net/api/users/johndoe', res => {
    res.on('end', () => {
      context.log(`Done after ${new Date() - start} ms`)
      context.done()
    })
    res.on('data', d => context.log(d.toString()))
    res.on('err', e => context.log(e) && context.done(e))
  })
}

// use 'EXEC_LOCAL = TRUE node index.js' to run locally
process.env.EXEC_LOCAL && module.exports({log: console.log, done: process.exit})
