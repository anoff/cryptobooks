var { graphql, buildSchema } = require('graphql')

var schema = buildSchema(`
  type Query {
    all(from: String, until: String): Rate
  }

  type Rate {
    crypto: String!
    fiat: [Fiat]!
    timestamp: String!
  }

  type Fiat {
      type: String!
      value: Float!
  }
`)

var root = { all: () => {
  return {
    crypto: 'BTC',
    fiat: [{
      type: 'EUR',
      value: 123
    }],
    timestamp: new Date() // TODO use graphql-iso-date
  }
} }

graphql(schema, '{ all }', root).then((response) => {
  console.log(response)
})
