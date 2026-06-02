# Stellar Seat Booking - ChaiCode Cinema 🍿

A premium, modern movie seat booking application featuring a robust custom-built authentication system, real-time interactive seat booking, and structured PostgreSQL database integration.

---

## 🚀 Key Features

* **Interactive Seat Booking**: Responsive, modern seat mapping grid built with HTML, Tailwind CSS, and custom styling. Real-time updates and active booking confirmation dialogs.
* **Full-featured Custom Auth Module**:
  * **User Registration & Login**: Validated using robust `Joi` DTO schemas and encrypted with `bcrypt` (10 rounds).
  * **Email Verification**: Sends an automatic verification email using Gmail SMTP (`nodemailer`) on registration.
  * **JWT Sessions**: Double token mechanism utilizing short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d).
  * **Password Lifecycle**: Forgot password link generation and secure password reset using one-time tokens.
  * **Secure Logout**: Revokes and invalidates session tokens in the database.
* **Centralized Logic & Clean Architecture**:
  * Controllers are kept clean with standard `try/catch` wrappers.
  * Consistent responses using standard helper classes (`ApiResponse` and `ApiError`).

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla ES6)
* **Backend**: Node.js, Express.js (v5.x)
* **Database**: PostgreSQL (with transactional integrity for bookings)
* **Auth & Security**: JWT (`jsonwebtoken`), Password hashing (`bcrypt`), validation (`joi`)
* **Mailing**: SMTP integration (`nodemailer`)

---

## 📁 Directory Structure

```
book-my-ticket/
├── auth/
│   ├── auth.contoller.js       # Handles incoming request logic & routes to services
│   ├── auth.routes.js          # Defines routing and schema middleware validation
│   └── auth.service.js         # Core business logic (hashing, JWTs, DB operations)
├── common/
│   ├── dto/                    # Data Transfer Objects & validation schemas (Joi)
│   │   ├── BaseDto.js
│   │   ├── LoginDto.js
│   │   └── RegisterDto.js
│   ├── middleware/             # Express middlewares (Validation, Auth validation)
│   │   └── auth.middleware.js
│   └── utils/                  # Centralized utilities & formatters
│       ├── ApiError.js         # Standarized API error formats
│       ├── ApiResponse.js      # Standarized success response formats
│       ├── email.js            # Nodemailer transport configurations
│       └── jwt.token.js        # JWT generation and verification helpers
├── db/
│   └── index.js                # pg.Pool database connection configurations
├── index.html                  # Seating layout grid user interface
├── index.mjs                   # Core Express app setup, routes, and DB initialization
├── package.json                # Dependencies and project metadata
└── README.md                   # Project documentation
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
> Make sure `EMAIL_PASSWORD` is a 16-character Google App Password (spaces removed) rather than your actual account password.

---

## 🏗️ Quick Start

### 1. Prerequisites
Ensure you have **Node.js** and **PostgreSQL** installed and running on your system.

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database
Initialize the schema (e.g. `users`, `seats` tables):
```bash
npm run db:init
```

### 4. Run the Server
```bash
node index.mjs
```
The server will start listening at `http://localhost:8080`.

---

## 🔒 Database Transaction Security & Concurrency Control

The seat booking process implements enterprise-grade database management and security practices directly within the PostgreSQL transaction boundary:

* **Atomic Seat Locking (Race Condition Prevention)**:
  * Employs a row-level write lock utilizing `SELECT * FROM seats WHERE id = $1 AND isbooked = 0 FOR UPDATE` inside an active transaction block.
  * This ensures that if multiple users attempt to book the exact same seat simultaneously, only one transaction succeeds. The other concurrent attempts block or fail safely instead of creating double-bookings.
* **Minimized Transaction Scope**:
  * The transaction block (`BEGIN` / `COMMIT`) is kept as small as possible to minimize lock contention and maximize server throughput.
* **SQL Injection Protection**:
  * All queries use parameterized inputs (e.g., passing variables in placeholders like `$1` and `$2` instead of dynamic ES6 template string interpolation). This fully neutralizes SQL injection vulnerabilities.
* **Optimized Resource Management**:
  * A PostgreSQL client is fetched from the connection pool (`pool.connect()`) and strictly released back to the pool (`conn.release()`) upon completion to avoid database connection exhaustion.

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Request Body / Headers |
|---|---|---|---|
| **POST** | `/auth/register` | Registers a user and sends verification email. | `{ firstName, lastName, email, password }` |
| **GET** | `/auth/verify` | Verifies user's email using token from email link. | Query Param: `?token=<verification_token>` |
| **POST** | `/auth/login` | Authenticates user credentials and returns tokens. | `{ email, password }` |
| **POST** | `/auth/generate-new-access-token` | Generates a new access token using a refresh token. | Header: `Authorization: Bearer <refresh_token>` |
| **POST** | `/auth/forgot-password` | Sends a password reset link to user's email. | `{ email }` |
| **POST** | `/auth/reset-password` | Resets the password using a reset token. | `{ token, password }` |
| **POST** | `/auth/logout` | Revokes the current session and clears refresh token. | Header: `Authorization: Bearer <refresh_token>` |

### Seat Booking Endpoints

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/seats` | Retrieves all cinema seats and booking statuses. |
| **PUT** | `/:id/:name` | Books a specific seat under a customer's name (transactionally safe). |
