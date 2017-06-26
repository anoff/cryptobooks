# cryptobooks

> provide cryptocurrency prices and book keeping

## components

### collecting prices

Prices for various crypto currencies are collected every minute via azure functions and stored in cosmos DB.

* [x] Playground function and table storage
* [x] Deploy functions via github/infra-as-code
* [x] re-write storage [table design](https://docs.microsoft.com/en-us/azure/storage/storage-table-design-guide) to have `partitionKey = coin` & `rowKey = date`
* [x] figure out how to add old data
    * maybe revise aggregates depending on availabily of historic data
    * ➡️ use day [day history API](https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym=USD&limit=1000), see [spec](https://www.cryptocompare.com/api/#-api-data-histoday-), needs one query per `coin/currency` pair but should be executable within rate limits as it allows 2000 days at once

### aggregating prices

Build aggregates of the full price history for use in the web UI.

* [ ] add aggregation function to generate `10min`, `30min`, `1hr`, `12hr`, `1d`, `10d` summaries
* [ ] define when aggregates should be built
    * build all after update / collecting
    * individual CRON jobs
    * single independent CRON job with divisor

### web API - prices

Provide API endpoints that give the aggregated metrics for various coins

* [ ] authorization
* [ ] caching
* [ ] `GET` aggregates
* [ ] `GET` explicit day rating

### web API - assets (books)

Store encrypted `JSON` blob of assets in a database.

* Authentication via `username` and a `password hash`
* Client side decryption of the blob with the actual unhashed password (password never leaves client)

* [ ] RESTful `PUT`, `POST`, `GET`, `DELETE` API design

### web UI

* [ ] add/remove transactions
    * date
    * currency
    * custom price (defaults to historic price)
* [ ] list total assets
    * table
    * pie chart
    * _annotate_ to keep track where certain amount of assets are stored
* [ ] chart of profit/loss with various time scales

## Known/accepted limitations

* no exchange support / one price only

## License

As I don't want people to turn this into a product without feeding back to OSS I decided to license this under [GPL](./LICENSE) by Andreas Offenhaeuser <http://anoff.io>