import BaseDto from "../dto/BaseDto.js"
import ApiError from "../utils/ApiError.js"

const AuthMiddleWare = (baseDto)=>{
    return (req, res, next) => {
        const { error, value } = baseDto.validate(req.body)
        if (error) {
            return ApiError.handle(ApiError.badRequest(error), res);
        }
        req.body = value
        next()
    }
}

export default AuthMiddleWare;