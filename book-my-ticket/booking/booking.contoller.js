import BookingService from "./booking.service.js";
import ApiError from "../common/utils/ApiError.js";
import ApiResponse from "../common/utils/ApiResponse.js"
class BookingController {
    static async getSeats(req, res) {
        try {
            const result = await BookingService.getSeats();
            const apiResponse = ApiResponse.success(result, "Seats fetched successfully");
            return res.status(apiResponse.statusCode).json(apiResponse);
        } catch (ex) {
            ApiError.handle(ex, res);
        }
    }

    static async bookSeat(req, res) {
        try {
            const {id, name} = req.params;
            const {userId} = req.body;
            const result = await BookingService.bookSeat(id, name, userId);
            const apiResponse = ApiResponse.success(result, "Seat booked successfully");
            return res.status(apiResponse.statusCode).json(apiResponse);
        } catch (ex) {
            ApiError.handle(ex, res);
        }
    }
}

export default BookingController;
