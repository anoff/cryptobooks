const TABLENAME = 'users'

const azure = require('azure-storage')

// check if accessKey is correct, otherwise respond with 401 immediately
function isAuth (req, dbEntry, context) {
  if (!req.headers || !dbEntry || dbEntry.accessKey !== req.headers['access-key']) {
    context.res = {
      status: 401,
      body: { msg: 'Invalid accessKey' }
    }
    context.done()
    return false
  } else {
    return true
  }
}

module.exports = function (context, req) {
  // shorthand for sending a response
  function send (body) {
    if (typeof body === 'string') {
      context.res = {
        body: { msg: body }
      }
    } else {
      context.res = body
    }
    context.done()
  }

  const method = req.method.toUpperCase()
  const dbEntry = context.bindings.usersIn
  const username = req.params.name
  const accessKey = req.headers['access-key']
  const tableService = azure.createTableService(process.env.AzureWebJobsStorage)

  switch (method) {
    case 'GET':
      if (isAuth(req, dbEntry, context)) {
        delete dbEntry.RowKey
        delete dbEntry.PartitionKey
        send({body: dbEntry})
      }
      break
    case 'POST':
      // check if name does not exist
      if (!dbEntry) {
        // new users needs to come with accessKey
        if (!accessKey) {
          send({status: 401, body: {msg: 'Please specify an accessKey'}})
        } else {
          // TODO check body size/type to prevent abuse
          const entry = {
            PartitionKey: 'users',
            RowKey: username,
            timeCreated: new Date(),
            timeUpdated: new Date(),
            accessKey,
            assets: req.body
          }
          tableService.insertEntity(TABLENAME, entry, function (error, result, response) {
            if (!error) {
              send('User created')
            } else {
              send({status: 400, body: {msg: error}})
            }
          })
        }
      // user already exists
      } else {
        send({
          status: 400,
          body: {msg: 'Username already taken'}
        })
      }
      break
    case 'PUT':
      if (!dbEntry) {
        send({status: 404, body: {msg: 'Username does not exist. Use POST to create new'}})
      } else {
        if (isAuth(req, dbEntry, context)) {
          // TODO check body size/type
          dbEntry.assets = req.body
          dbEntry.timeUpdated = new Date()
          tableService.replaceEntity(TABLENAME, dbEntry, function (error, result, response) {
            if (!error) {
              send('Assets updated')
            } else {
              send({status: 400, body: {msg: error}})
            }
          })
        }
      }
      break
    case 'DELETE':
      if (!dbEntry) {
        send({status: 404, body: {msg: 'Username does not exist'}})
      } else {
        if (isAuth(req, dbEntry, context)) {
          tableService.deleteEntity(TABLENAME, dbEntry, function (error, result, response) {
            if (!error) {
              send('User deleted')
            } else {
              send({status: 400, body: {msg: error}})
            }
          })
        }
      }
      break
    default:
      send({
        status: 500,
        body: {msg: 'Unknown operation'}
      })
  }
}
