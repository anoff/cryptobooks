function checkAuth (req, dbEntry) {
  if (!req.headers || !dbEntry) {
    return false
  }
  const accessKey = req.headers['access-key']
  return dbEntry.accessKey === accessKey
}

function isAuth (req, dbEntry, context) {
  if (!checkAuth(req, dbEntry)) {
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
  const dbOut = context.bindings.usersOut = []
  const username = req.params.name
  const accessKey = req.headers['access-key']

  context.log(dbEntry)
  switch (method) {
    case 'GET':
      if (isAuth(req, dbEntry, context)) {
        send({body: dbEntry})
      }
      break
    case 'POST':
      // check if name does not exist
      if (!dbEntry) {
        // new users needs to come with accessKey
        if (!accessKey) {
          send({status: 401, body: { msg: 'Please specify an accessKey' }})
        } else {
          // TODO check body size/type to prevent abuse
          dbOut.push({
            PartitionKey: 'users',
            RowKey: username,
            timeCreated: new Date(),
            timeUpdated: new Date(),
            accessKey,
            assets: req.body
          })
          send('User created')
        }
      // user already exists
      } else {
        send({
          status: 400,
          body: { msg: 'Username already taken' }
        })
      }
      break
    default:
      send({
        status: 500,
        body: { msg: 'Unknown operation' }
      })
  }
}
