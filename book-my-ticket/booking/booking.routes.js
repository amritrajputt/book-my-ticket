import express from "express";
import BookingController from "./booking.contoller.js";

const router = express.Router();

router.get("/seats", BookingController.getSeats);
router.put("/:id/:name", BookingController.bookSeat);

export default router;
