import pool from "../db/index.js";

class BookingService {
    static async getSeats() {
        const result = await pool.query("select * from seats");
        return result.rows;
    }

    static async bookSeat(id, name) {
        const conn = await pool.connect();
        
        await conn.query("BEGIN");
        
        const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
        const result = await conn.query(sql, [id]);

        if (result.rowCount === 0) {
            conn.release();
            return { error: "Seat already booked" };
        }

        const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
        const updateResult = await conn.query(sqlU, [id, name]);

        await conn.query("COMMIT");
        conn.release();
        return updateResult;
    }
}

export default BookingService;
