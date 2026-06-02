//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import pool from "./db/index.js";
import authRouter from "./auth/auth.routes.js";
import bookingRouter from "./booking/booking.routes.js";

// =========================================================================
// OIDC INTEGRATION STEP:
// Load environment variables, import express-session, and import the OIDC
// authentication router to expose the authentication routes.
// =========================================================================


const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;


const app = new express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use("/auth", authRouter);
app.use("/", bookingRouter);

// =========================================================================
// OIDC INTEGRATION STEP:
// Set up server-side session storage middleware and define route mounting
// to register OIDC endpoints under the desired route prefix.
// =========================================================================

app.listen(port, () => console.log("Server starting on port: " + port));
try {
  const res = await pool.query("SELECT NOW()");
  console.log("✔ Database connected successfully at:", res.rows[0].now);
}
catch (err) {
  console.error("❌ Database connection failed at startup:", err.message);
}
