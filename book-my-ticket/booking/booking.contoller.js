import BookingService from "./booking.service.js";

class BookingController {
    static async getSeats(req, res) {
        try {
            const seats = await BookingService.getSeats();
            res.send(seats);
        } catch (ex) {
            console.log(ex);
            res.send(500);
        }
    }

    static async bookSeat(req, res) {
        try {
            const id = req.params.id;
            const name = req.params.name;
            const result = await BookingService.bookSeat(id, name);
            res.send(result);
        } catch (ex) {
            console.log(ex);
            res.send(500);
        }
    }
}

export default BookingController;
