import express from "express";
import BookingController from "./booking.contoller.js";
import bookingMiddleware from "./booking.middleware.js";
const router = express.Router();

router.get("/seats",bookingMiddleware, BookingController.getSeats);
router.put("/:id/:name", bookingMiddleware, BookingController.bookSeat);

export default router;
