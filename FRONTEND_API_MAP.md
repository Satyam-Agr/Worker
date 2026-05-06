# Worker App Frontend API Map

Base URL for local development: `http://localhost:8080`

The backend currently exposes REST routes only. Login is validated through Spring Security and creates a server-side session (`JSESSIONID` cookie). The API does not issue JWT tokens.

## Seeded Data In Current Database

This data was inserted into `workerDB` on `2026-05-06`.

### Categories

| id | name | basePrice |
| --- | --- | --- |
| 1 | Cleaner | 500.00 |
| 2 | Electrician | 750.00 |
| 3 | Loader | 600.00 |

### Workers

| userId | name | phone | role | language | categoryId | category |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Amit Kumar | 9000000001 | WORKER | en | 1 | Cleaner |
| 2 | Priya Sharma | 9000000002 | WORKER | en | 2 | Electrician |
| 3 | Rahul Verma | 9000000003 | WORKER | en | 3 | Loader |
| 4 | Sneha Singh | 9000000004 | WORKER | en | 1 | Cleaner |
| 5 | Vikram Patel | 9000000005 | WORKER | en | 2 | Electrician |

### Customers

| userId | name | phone | role | language |
| --- | --- | --- | --- | --- |
| 6 | Neha Gupta | 9100000001 | CUSTOMER | en |
| 7 | Arjun Mehta | 9100000002 | CUSTOMER | en |

## Enums

`UserRole`: `CUSTOMER`, `WORKER`

`JobStatus`: `REQUESTED`, `ACCEPTED`, `COMPLETED`, `CANCELLED`

## Error Responses

Validation errors return HTTP `400` with field names as keys:

```json
{
  "phone": "must not be blank",
  "role": "must not be null"
}
```

Business errors return HTTP `400` with a message:

```json
{
  "message": "Phone number is already registered"
}
```

## Routes

### Register User

`POST /auth/register`

Creates a customer or worker user.

Request body:

```json
{
  "name": "Riya Sen",
  "phone": "9999999999",
  "role": "CUSTOMER",
  "language": "en"
}
```

Required fields:

| field | type | accepted values |
| --- | --- | --- |
| name | string | non-empty |
| phone | string | non-empty, unique |
| role | string | `CUSTOMER` or `WORKER` |
| language | string | non-empty |

Success response: HTTP `201`

```json
{
  "createdAt": "2026-05-06T13:10:00",
  "updatedAt": "2026-05-06T13:10:00",
  "id": 8,
  "name": "Riya Sen",
  "phone": "9999999999",
  "role": "CUSTOMER",
  "language": "en"
}
```

Notes:

Registering a user with role `WORKER` creates only the user row. Use `POST /worker/profile/create` to create that worker's profile.

### Login By Phone

`POST /auth/login`

Authenticates using Spring Security with phone as the login identifier.

Request body:

```json
{
  "phone": "9100000001"
}
```

Required fields:

| field | type | accepted values |
| --- | --- | --- |
| phone | string | non-empty, must exist in `users.phone` |

Success response: HTTP `200`

```json
{
  "createdAt": "2026-05-06T13:10:00",
  "updatedAt": "2026-05-06T13:10:00",
  "id": 6,
  "name": "Neha Gupta",
  "phone": "9100000001",
  "role": "CUSTOMER",
  "language": "en"
}
```

### Logout

`POST /auth/logout`

Clears Spring Security context and invalidates the current session.

Request body:

None

Success response: HTTP `200`

```json
{
  "message": "Logged out successfully"
}
```

### Get All Categories

`GET /category/all`

Returns all categories.

Success response: HTTP `200`

```json
[
  {
    "id": 1,
    "name": "Cleaner",
    "basePrice": 500.00
  },
  {
    "id": 2,
    "name": "Electrician",
    "basePrice": 750.00
  },
  {
    "id": 3,
    "name": "Loader",
    "basePrice": 600.00
  }
]
```

### Set Worker Availability

`POST /worker/availability`

Marks an existing worker profile available or unavailable.

Request body:

```json
{
  "userId": 1,
  "isAvailable": true
}
```

Required fields:

| field | type | accepted values |
| --- | --- | --- |
| userId | number | existing worker user id with a worker profile |
| isAvailable | boolean | `true` or `false` |

Success response: HTTP `200`

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "name": "Amit Kumar",
    "phone": "9000000001",
    "role": "WORKER",
    "language": "en"
  },
  "category": {
    "id": 1,
    "name": "Cleaner",
    "basePrice": 500.00
  },
  "rating": 0.0,
  "totalJobs": 0,
  "available": true
}
```

### Get Available Workers By Category

`GET /worker/available?categoryId={categoryId}`

Returns worker profiles where `isAvailable = true` for the category.

Query params:

| param | type | accepted values |
| --- | --- | --- |
| categoryId | number | existing category id |

Example:

`GET /worker/available?categoryId=1`

Success response: HTTP `200`

```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "name": "Amit Kumar",
      "phone": "9000000001",
      "role": "WORKER",
      "language": "en"
    },
    "category": {
      "id": 1,
      "name": "Cleaner",
      "basePrice": 500.00
    },
    "rating": 0.0,
    "totalJobs": 0,
    "available": true
  }
]
```

### Get Nearby Workers

`GET /worker/nearby?lat={lat}&lng={lng}&categoryId={categoryId}&radiusKm={radiusKm}`

Returns available workers in the given category, filtered by radius and sorted by nearest distance first.

Query params:

| param | type | accepted values |
| --- | --- | --- |
| lat | number | latitude, usually `-90.0` to `90.0` |
| lng | number | longitude, usually `-180.0` to `180.0` |
| categoryId | number | existing category id |
| radiusKm | number | distance in kilometers |

Example:

`GET /worker/nearby?lat=28.6139&lng=77.2090&categoryId=1&radiusKm=10`

Success response: HTTP `200`

```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "name": "Amit Kumar",
      "phone": "9000000001",
      "role": "WORKER",
      "language": "en"
    },
    "category": {
      "id": 1,
      "name": "Cleaner",
      "basePrice": 500.00
    },
    "rating": 0.0,
    "totalJobs": 0,
    "available": true
  }
]
```

### Create Worker Profile

`POST /worker/profile/create`

Creates a worker profile for a user with role `WORKER`.

Request body:

```json
{
  "userId": 8,
  "categoryId": 1
}
```

Required fields:

| field | type | accepted values |
| --- | --- | --- |
| userId | number | existing user id with role `WORKER` |
| categoryId | number | existing category id |

Success response: HTTP `201`

```json
{
  "id": 6,
  "user": {
    "id": 8,
    "name": "New Worker",
    "phone": "9999999998",
    "role": "WORKER",
    "language": "en"
  },
  "category": {
    "id": 1,
    "name": "Cleaner",
    "basePrice": 500.00
  },
  "rating": 0.0,
  "totalJobs": 0,
  "available": false
}
```

### Create Job

`POST /job/create`

Creates a job between an existing customer and worker for a category. The job starts with status `REQUESTED`; price is copied from the category base price.

Request body:

```json
{
  "customerId": 6,
  "workerId": 1,
  "categoryId": 1
}
```

Required fields:

| field | type | accepted values |
| --- | --- | --- |
| customerId | number | existing user id with role `CUSTOMER` |
| workerId | number | existing user id with role `WORKER` |
| categoryId | number | existing category id |

Success response: HTTP `201`

```json
{
  "id": 1,
  "customer": {
    "id": 6,
    "name": "Neha Gupta",
    "phone": "9100000001",
    "role": "CUSTOMER",
    "language": "en"
  },
  "worker": {
    "id": 1,
    "name": "Amit Kumar",
    "phone": "9000000001",
    "role": "WORKER",
    "language": "en"
  },
  "category": {
    "id": 1,
    "name": "Cleaner",
    "basePrice": 500.00
  },
  "status": "REQUESTED",
  "price": 500.00,
  "createdAt": "2026-05-06T13:10:00"
}
```

### Update Job Status

`PUT /job/status`

Updates an existing job status.

Request body:

```json
{
  "jobId": 1,
  "status": "ACCEPTED"
}
```

Required fields:

| field | type | accepted values |
| --- | --- | --- |
| jobId | number | existing job id |
| status | string | `REQUESTED`, `ACCEPTED`, `COMPLETED`, `CANCELLED` |

Success response: HTTP `200`

```json
{
  "id": 1,
  "status": "ACCEPTED",
  "price": 500.00,
  "createdAt": "2026-05-06T13:10:00"
}
```

### Get Jobs For User

`GET /job/user/{id}`

Returns jobs where the user is either the customer or the worker.

Path params:

| param | type | accepted values |
| --- | --- | --- |
| id | number | existing user id |

Example:

`GET /job/user/6`

Success response: HTTP `200`

```json
[
  {
    "id": 1,
    "customer": {
      "id": 6,
      "name": "Neha Gupta",
      "phone": "9100000001",
      "role": "CUSTOMER",
      "language": "en"
    },
    "worker": {
      "id": 1,
      "name": "Amit Kumar",
      "phone": "9000000001",
      "role": "WORKER",
      "language": "en"
    },
    "category": {
      "id": 1,
      "name": "Cleaner",
      "basePrice": 500.00
    },
    "status": "REQUESTED",
    "price": 500.00,
    "createdAt": "2026-05-06T13:10:00"
  }
]
```

### Update User Location

`POST /location/update`

Creates or updates the latest location for a user.

Request body:

```json
{
  "userId": 1,
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

Required fields:

| field | type | accepted values |
| --- | --- | --- |
| userId | number | existing user id |
| latitude | number | `-90.0` to `90.0` |
| longitude | number | `-180.0` to `180.0` |

Success response: HTTP `200`

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "name": "Amit Kumar",
    "phone": "9000000001",
    "role": "WORKER",
    "language": "en"
  },
  "latitude": 28.6139,
  "longitude": 77.2090,
  "updatedAt": "2026-05-06T13:10:00"
}
```

## Missing Backend Routes The Frontend May Need

The current backend does not expose these endpoints:

| needed by frontend | current workaround |
| --- | --- |
| Create/list reviews | Model and repository exist, but no controller route exists |
| Auth token issuance (JWT/session cookie) | Keep user object client-side after login |
