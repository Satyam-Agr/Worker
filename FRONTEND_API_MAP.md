# Worker App Frontend API Map (Backend-Synced)

Last synced with backend code on `2026-05-06`.

Base URL: `http://localhost:8080`

## Auth/CORS Notes

1. Auth is session-based (Spring Security).  
   Login creates a `JSESSIONID` cookie.
2. Include credentials in frontend requests:
   `fetch(..., { credentials: "include" })`
3. CORS is currently restricted to `http://localhost:3000`.

## Enums

`UserRole`
- `CUSTOMER`
- `WORKER`

`JobStatus`
- `REQUESTED`
- `ACCEPTED`
- `REJECTED`
- `CANCELLED`
- `STARTED`
- `COMPLETED`

## Error Format

Validation error (`400`):

```json
{
  "fieldName": "validation message"
}
```

Business error (`400`):

```json
{
  "message": "error message"
}
```

## Response Shapes (Important)

`User`:

```json
{
  "id": 1,
  "name": "Amit Kumar",
  "phone": "9000000001",
  "role": "WORKER",
  "language": "en",
  "createdAt": "2026-05-06T13:10:00",
  "updatedAt": "2026-05-06T13:10:00"
}
```

`Category`:

```json
{
  "id": 1,
  "name": "Cleaner",
  "basePrice": 500.00
}
```

`WorkerProfile` (nested objects; availability may appear as `available`):

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
  "available": true,
  "rating": 4.5,
  "totalJobs": 10
}
```

`Job` (full nested details + new fields):

```json
{
  "id": 101,
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
  "description": "Kitchen deep clean",
  "createdAt": "2026-05-06T13:10:00",
  "startedAt": null,
  "completedAt": null
}
```

`Review`:

```json
{
  "id": 1,
  "job": { "id": 101 },
  "reviewer": { "id": 6, "name": "Neha Gupta" },
  "reviewee": { "id": 1, "name": "Amit Kumar" },
  "rating": 5,
  "comment": "Great service"
}
```

## Endpoints

### Auth

`POST /auth/register`

Request body:

```json
{
  "name": "Riya Sen",
  "phone": "9999999999",
  "role": "CUSTOMER",
  "language": "en"
}
```

Required:
- `name` (string, non-blank)
- `phone` (string, non-blank, unique)
- `role` (`CUSTOMER` or `WORKER`)
- `language` (string, non-blank)

Response: `201` + `User`

---

`POST /auth/login`

Request body:

```json
{
  "phone": "9100000001"
}
```

Required:
- `phone` (string, non-blank)

Response: `200` + `User`  
Also sets session cookie.

---

`POST /auth/logout`

Request body: none

Response `200`:

```json
{
  "message": "Logged out successfully"
}
```

### Category

`GET /category/all`

Response: `200` + `Category[]`

### Worker

`POST /worker/profile/create`

Request body:

```json
{
  "userId": 8,
  "categoryId": 1
}
```

Required:
- `userId` (Long)
- `categoryId` (Long)

Rules:
- user must exist and be `WORKER`
- profile for user must not already exist

Response: `201` + `WorkerProfile`

---

`POST /worker/availability`

Request body:

```json
{
  "userId": 1,
  "isAvailable": true
}
```

Required:
- `userId` (Long)
- `isAvailable` (Boolean)

Response: `200` + `WorkerProfile`

---

`GET /worker/available?categoryId={categoryId}`

Query params:
- `categoryId` (Long)

Response: `200` + `WorkerProfile[]`

---

`GET /worker/nearby?lat={lat}&lng={lng}&categoryId={categoryId}&radiusKm={radiusKm}`

Query params:
- `lat` (double)
- `lng` (double)
- `categoryId` (Long)
- `radiusKm` (double)

Response: `200` + `WorkerProfile[]`  
Sorted by nearest distance first.

### Location

`POST /location/update`

Request body:

```json
{
  "userId": 1,
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

Required:
- `userId` (Long)
- `latitude` (Double, `-90.0` to `90.0`)
- `longitude` (Double, `-180.0` to `180.0`)

Response: `200` + `Location`

### Job

`POST /job/create`

Request body:

```json
{
  "customerId": 6,
  "workerId": 1,
  "categoryId": 1,
  "description": "Kitchen deep clean"
}
```

Required:
- `customerId` (Long)
- `workerId` (Long)
- `categoryId` (Long)

Optional:
- `description` (String)

Response: `201` + `Job`

---

`PUT /job/reject`

Request body:

```json
{
  "jobId": 101,
  "workerId": 1
}
```

Response: `200` + `Job` (`status = REJECTED`)

---

`PUT /job/start`

Request body:

```json
{
  "jobId": 101,
  "workerId": 1
}
```

Response: `200` + `Job` (`status = STARTED`, `startedAt` set)

---

`PUT /job/complete`

Request body:

```json
{
  "jobId": 101,
  "workerId": 1
}
```

Response: `200` + `Job` (`status = COMPLETED`, `completedAt` set)

---

`PUT /job/cancel`

Request body:

```json
{
  "jobId": 101,
  "userId": 6
}
```

Response: `200` + `Job` (`status = CANCELLED`)

---

`PUT /job/status` (backward-compatible generic route)

Request body:

```json
{
  "jobId": 101,
  "status": "ACCEPTED",
  "userId": 1
}
```

Required:
- `jobId` (Long)
- `status` (`JobStatus`)

Optional:
- `userId` (Long).  
If omitted, backend infers actor in limited cases for compatibility.

Response: `200` + `Job`

---

`GET /job/user/{id}`

Path param:
- `id` (Long user id)

Response: `200` + `Job[]`

### Review

`POST /review/create`

Request body:

```json
{
  "jobId": 101,
  "reviewerId": 6,
  "rating": 5,
  "comment": "Great service"
}
```

Required:
- `jobId` (Long)
- `reviewerId` (Long)
- `rating` (Integer, `1` to `5`)

Optional:
- `comment` (String)

Rules:
- job must be `COMPLETED`
- reviewer must be customer or worker from that job
- one review per reviewer per job

Response: `201` + `Review`

Side effect:
- if reviewee is a worker, worker profile rating is recalculated from all reviews.

---

`GET /review/user/{id}`

Path param:
- `id` (Long user id)

Response: `200` + `Review[]` where `reviewee.id = {id}`

## Job Transition Rules (Strict)

Allowed transitions:

1. `REQUESTED -> CANCELLED` (only customer)
2. `REQUESTED -> REJECTED` (only assigned worker)
3. `REQUESTED -> ACCEPTED` (only assigned worker)
4. `ACCEPTED -> CANCELLED` (customer or assigned worker)
5. `ACCEPTED -> STARTED` (only assigned worker)
6. `STARTED -> COMPLETED` (only assigned worker)

Blocked:

1. Any cancel after `STARTED`
2. Any transition not listed above
