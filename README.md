# Book My Ticket 🍿

A modern cinema seat booking application featuring atomic database seat locking during booking, a secure custom-built JWT authentication system, and PostgreSQL database integration.

---

## 🚀 Key Features

* **Interactive Seat Booking**: Responsive seat mapping grid on the frontend. Seats update in real time.
* **Atomic Seat Locking**: Row-level `SELECT FOR UPDATE` prevents double-booking when multiple users book the same seat simultaneously.
* **Full-featured Custom Auth Module**:
  * **User Registration & Login**: Validated using `Joi` DTO schemas, passwords encrypted with `bcrypt` (10 rounds).
  * **Email Verification**: Automatic verification email sent via Gmail SMTP (`nodemailer`) on registration.
  * **JWT Sessions**: Short-lived Access Tokens (15m) + long-lived Refresh Tokens (7d).
  * **Password Lifecycle**: Forgot password link generation and one-time token based password reset.
  * **Secure Logout**: Refresh token is revoked and cleared from the database on logout.
* **Protected Booking Routes**: Seat endpoints are guarded by JWT access token middleware (`bookingMiddleware`).
* **Booking History**: Every successful booking stores `user_id` + `seat_id` in a separate `bookings` table — uniquely tied to the user's UUID, not just a name.
* **Clean Architecture**: Modular folder structure separating auth and booking into dedicated modules with controllers, services, routes, and middleware.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Tailwind CSS, Vanilla JS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (`pg` pool) |
| **Auth** | JWT (`jsonwebtoken`), `bcrypt`, `joi` |
| **Mailing** | `nodemailer` (Gmail SMTP) |

---

## 📁 Directory Structure

```
book-my-ticket/
├── auth/
│   ├── auth.contoller.js       # Handles incoming auth request logic
│   ├── auth.routes.js          # Auth routing with Joi schema middleware
│   └── auth.service.js         # Business logic (hashing, JWTs, DB ops)
├── booking/
│   ├── booking.contoller.js    # Handles seat fetching & booking requests
│   ├── booking.middleware.js   # JWT access token verification middleware
│   ├── booking.routes.js       # Booking routes (protected by middleware)
│   └── booking.service.js      # Transactional DB operations for seat booking
├── common/
│   ├── dto/                    # Joi validation schemas (Data Transfer Objects)
│   │   ├── BaseDto.js
│   │   ├── LoginDto.js
│   │   └── RegisterDto.js
│   ├── middleware/
│   │   └── auth.middleware.js  # Joi DTO validation middleware for auth routes
│   └── utils/
│       ├── ApiError.js         # Standardized API error class & handler
│       ├── ApiResponse.js      # Standardized success response class
│       ├── email.js            # Nodemailer transporter configuration
│       └── jwt.token.js        # JWT generation & verification helpers
├── db/
│   ├── index.js                # pg.Pool connection setup
│   └── models/
│       ├── auth.model.sql      # Users table schema
│       ├── seats.model.sql     # Seats table schema
│       └── users.booking.sql   # Bookings table schema (user_id + seat_id)
├── index.html                  # Seating grid UI
├── index.mjs                   # Express app entry point
├── .env                        # Environment variables (not committed)
└── package.json
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the project:

```env
PORT=8080
ACCESS_TOKEN_SECRET=your_super_secret_access_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

> [!NOTE]
> `EMAIL_PASSWORD` must be a 16-character **Google App Password** (not your Google account password). Generate it from your Google Account → Security → App Passwords.

---

## 🏗️ Quick Start

### 1. Prerequisites
- **Node.js** v18+
- **PostgreSQL** running locally

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
Run the SQL files in `db/models/` in this order in your PostgreSQL client:
1. `auth.model.sql` — creates `users` table
2. `seats.model.sql` — creates `seats` table and seeds 20 seats
3. `users.booking.sql` — creates `bookings` table

### 4. Run the Server
```bash
node index.mjs
```
Server starts at `http://localhost:8080`.

---

## 🔒 Database Transaction Security & Concurrency Control

The seat booking process uses enterprise-grade PostgreSQL transaction management:

* **Atomic Seat Locking**: `SELECT * FROM seats WHERE id = $1 AND isbooked = 0 FOR UPDATE` — row-level write lock prevents two users from booking the same seat simultaneously (Race Condition prevention).
* **ROLLBACK on Failure**: If any error occurs mid-transaction, `ROLLBACK` is automatically called to keep the database consistent.
* **Minimized Transaction Scope**: `BEGIN` / `COMMIT` block is kept as small as possible to reduce lock contention.
* **SQL Injection Protection**: All queries use parameterized placeholders (`$1`, `$2`) — no string interpolation.
* **Connection Pool Management**: `pool.connect()` fetches a client and `conn.release()` is always called in `finally` to prevent connection exhaustion.

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Request Body / Headers |
|---|---|---|---|
| **POST** | `/auth/register` | ❌ | `{ firstName, lastName, email, password }` |
| **GET** | `/auth/verify` | ❌ | Query: `?token=<verification_token>` |
| **POST** | `/auth/login` | ❌ | `{ email, password }` |
| **POST** | `/auth/generate-new-access-token` | ✅ Refresh Token | Header: `Authorization: Bearer <refresh_token>` |
| **POST** | `/auth/forgot-password` | ❌ | `{ email }` |
| **POST** | `/auth/reset-password` | ❌ | `{ token, password }` |
| **POST** | `/auth/logout` | ✅ Refresh Token | Header: `Authorization: Bearer <refresh_token>` |

### Seat Booking Endpoints

> [!IMPORTANT]
> All booking endpoints require a valid **Access Token** in the `Authorization` header: `Bearer <access_token>`

| Method | Endpoint | Description | Request |
|---|---|---|---|
| **GET** | `/seats` | Fetch all seats with booking status. | Header: `Authorization: Bearer <access_token>` |
| **PUT** | `/:id/:name` | Book a seat by seat ID and user display name. | Header: `Authorization: Bearer <access_token>` · Body: `{ "userId": "<user_uuid>" }` |

#### Example Book Seat Request:
```
PUT http://localhost:8080/1/Amrit
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "userId": "82f86531-46f2-4315-b23a-2a88dac0993b"
}
```
