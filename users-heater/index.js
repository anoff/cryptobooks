const https = require('https')

module.exports = function (context, myTimer) {
  var start = new Date()
  return https.get('https://cbtraindev.azurewebsites.net/api/bert', res => {
    res.on('end', () => {
      context.log(`Done after ${new Date() - start} ms`)
      context.done()
    })
  })
}
