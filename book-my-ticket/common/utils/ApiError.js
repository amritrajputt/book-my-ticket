class ApiError extends Error {
    constructor (statusCode, response, message) {
        super(message || response);
        this.statusCode = statusCode;
        this.response = response;
        this.message = message || response;
    }
    static badRequest(response, message) {
        return new ApiError(400, response || "Bad request", message || response);
    }
    static internal(response, message) {
        return new ApiError(500, response || "Internal server error", message || response);
    }
    static notFound(response, message) {
        return new ApiError(404, response || "Not found", message || response);
    }
    static unAuthorized(response, message) {
        return new ApiError(401, response || "Unauthorized", message || response);
    }
    static handle(error, res) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.response
            });
        }
        console.error("Internal Server Error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}
export default ApiError;