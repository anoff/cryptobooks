# API design

<!-- TOC -->

- [API design](#api-design)
    - [Prices](#prices)
    - [User assets](#user-assets)
        - [Create new user account](#create-new-user-account)
        - [Update a users assets](#update-a-users-assets)
        - [Delete a user](#delete-a-user)
        - [Retrieve a users assets](#retrieve-a-users-assets)

<!-- /TOC -->
- 
## Prices

`TODO`

## User assets

Handling user assets is based on methods on the whole account. The server does not receive requests for individual asset updates. Instead the server only acts as a _cloud_ backup of an encrypted data blob. The key to decrypt the data is only known by the user and does not leave the client.

Authentication to _access_/_change_ a blob is done via `username` and `password hash`.

All resources need to be `SSL` encrypted.

### Create new user account

`method:` POST

`path:` /user

`headers`

|name|description|example value|
|---|---|---|
|access-key|the users access key|2f234650e60d83 (weird hash)|


`payload`

```json
{
    "username": "newuser",
    "assets": "encrypted JSON"
}
```

`response:` Classic HTTP Status Codes `200` (OK) and `400` (Error) for now

### Update a users assets

`method:` PUT

`path:` /user/\<userid\>

`headers`

|name|description|example value|
|---|---|---|
|access-key|the users access key|2f234650e60d83 (weird hash)|

`payload`

```json
{
    "assets": "encrypted JSON"
}
```

`response:` Classic HTTP Status Codes `200` (OK) and `400` (Error) for now

### Delete a user

`method:` DELETE

`path:` /user/\<userid\>

`headers`

|name|description|example value|
|---|---|---|
|access-key|the users access key|2f234650e60d83 (weird hash)|

`response:` Classic HTTP Status Codes `200` (OK) and `400` (Error) for now

### Retrieve a users assets

`method:` GET

`path:` /user/\<userid\>

`headers`

|name|description|example value|
|---|---|---|
|access-key|the users access key|2f234650e60d83 (weird hash)|

`response:` Classic HTTP Status Codes `200` (OK) and `400` (Error) for now
