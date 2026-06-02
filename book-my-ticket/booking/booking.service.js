import pool from "../db/index.js";
class BookingService {
    static async getSeats() {
        const seats = await pool.query("SELECT * FROM seats");
        return seats.rows;
    }

    static async bookSeat(id, name, userId) {
        const conn = await pool.connect()
        try {
            await conn.query("BEGIN")
            const checkSql = "SELECT * FROM seats WHERE id = $1 and isbooked = 0 FOR UPDATE"
            const result = await conn.query(checkSql, [id])
            if (result.rowCount === 0) {
                await conn.query("ROLLBACK")
                return { error: "Seat already booked" }
            }
            const sqlU = "update seats set isbooked = 1, name = $2 where id = $1"
            const updateResult = await conn.query(sqlU, [id, name])
            const bookingsSql = "INSERT INTO bookings (user_id, seat_id) VALUES ($1, $2)"
            await conn.query(bookingsSql, [userId, id])
            await conn.query("COMMIT")
            return updateResult;
        } catch (error) {
            await conn.query("ROLLBACK")
            throw error;
        } finally {
            conn.release()
        }
    

        /*
          Seat Book karne ke liye niche likhe steps follow hote hain controller mein:

          1. Database Connection Pool se client connect karein:
             const conn = await pool.connect();
             
          2. Transaction Start karein (BEGIN):
             await conn.query("BEGIN");
             Taaki agar transaction ke dauran koi error aaye to roll back ho jaye aur database corrupt na ho.

          3. Row Lock karein (SELECT FOR UPDATE):
             const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
             const result = await conn.query(sql, [id]);
             
             -> 'FOR UPDATE' row-level write lock lagata hai. 
             -> Isse agar do users ek saath same seat select karte hain, to database pehle request ko process karega,
                aur dusre request ko tab tak wait karwayega jab tak pehle wale ka lock release nahi hota.
             -> Isse double-booking (Race Condition) ki samasya hal ho jaati hai.

          4. Availability check karein:
             if (result.rowCount === 0) {
                 conn.release();
                 res.send({ error: "Seat already booked" });
                 return;
             }
             Agar row return nahi hui, iska matlab seat pehle se booked hai ya exist nahi karti. Yahan connection release karke error return kar dete hain.

          5. Update status in Database (UPDATE):
             const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
             await conn.query(sqlU, [id, name]);
             Seat status ko booked mark karte hain aur book karne wale ka naam save karte hain (SQL Injection se bachne ke liye parameters $1 aur $2 use kiye gaye hain).

          6. Transaction Commit karein (COMMIT):
             await conn.query("COMMIT");
             Sabhi changes ko database mein permanently save kar dete hain.

          7. Connection Release karein:
             conn.release();
             Connection ko wapis pool mein bhej dete hain taaki server resources free ho sakein.
        */
    }
}

export default BookingService;
