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

app.use("/auth", authRouter);

// =========================================================================
// OIDC INTEGRATION STEP:
// Set up server-side session storage middleware and define route mounting
// to register OIDC endpoints under the desired route prefix.
// =========================================================================

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});

//book a seat give the seatId and your name

// =========================================================================
// OIDC INTEGRATION STEP:
// Secure this endpoint by checking the session registry for the presence 
// of an active OIDC user profile. Re-route or reject requests that lack 
// a valid session. Use the username stored in the session profile instead 
// of expecting the client to pass the name parameter in the URI request.
// =========================================================================
app.put("/:id/:name", async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      res.send({ error: "Seat already booked" });
      return;
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    res.send(updateResult);
  } catch (ex) {
    console.log(ex);
    res.send(500);
  }
});

app.listen(port, () => console.log("Server starting on port: " + port));
try {
  const res = await pool.query("SELECT NOW()");
  console.log("✔ Database connected successfully at:", res.rows[0].now);
}
catch (err) {
  console.error("❌ Database connection failed at startup:", err.message);
}
