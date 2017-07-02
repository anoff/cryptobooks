# Thoughts on how to run the whole thing

## data sources



## hosting

### API

APIs are run via **azure functions** as serverless **node.JS** code backed by **azure storage** table noSQL database.

The functions are deployed directly via this repository per commit on master.

### Static content

The PWA should be fully static and can either be hosted on **zeit**, **github pages** or any other static hosting provider..

### Custom domain & routing

A custom domain managed by **cloudflare** will have `CNAME` records to map to static content and the APIs. This should prevent any `CORS` issues.


## Open

* [ ] Need to figure out how to block traffic to the original azure function domain
  * [this guy](https://kvaes.wordpress.com/2016/11/09/azure-a-poor-mans-ssl-termination-by-leveraging-cloudflare/) did it for a azure web app

* [ ] rate limit the API
  * Cloudflare offers rate limiting for `$0.05` for each `10,000` successfully served (i.e. not blocked) requests
  * [azure API management](https://docs.microsoft.com/en-us/azure/api-management/api-management-howto-product-with-rules)