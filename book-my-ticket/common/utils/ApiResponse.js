class ApiResponse {
    constructor(statusCode, message, response) {
        this.statusCode = statusCode;
        this.message = message;
        this.response = response;
    }
    static success(response, message) {
        return new ApiResponse(200, message || "success", response);
    }
    static created(response, message) {
        return new ApiResponse(201, message || "created", response);
    }
}

export default ApiResponse;