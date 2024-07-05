# User API Spec

## Register User

Endpoint : POST /api/users

Request Body :

```json
{
  "username": "CookyNdi",
  "password": "secret123",
  "name": "ndii"
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "CookyNdi",
    "name": "ndii"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username already registered"
}
```

## Login User

Endpoint : POST /api/users/login

Request Body :

```json
{
  "username": "Cookyndi",
  "password": "secret123"
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "CookyNdi",
    "name": "ndii",
    "token": "session_id_generated"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username or password is wrong"
}
```

## Get User

Endpoint : GET /api/users/current

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "data": {
    "username": "CookyNdi",
    "name": "ndii"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Unauthorized"
}
```

## Update User

Endpoint : PATCH /api/users/current

Headers :

- Authorization: token

Request Body :

```json
{
  "password": "secret!123", // optional, if want to change password
  "name": "Ndii" // optional, if want to change name
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "CookyNdi",
    "name": "ndii"
  }
}
```

## Logout User

Endpoint : DELETE /api/users/current

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "data": true
}
```
