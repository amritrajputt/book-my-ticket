import BaseDto from "./BaseDto.js";
import Joi from "joi";

class RegisterDto extends BaseDto {
  static schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().max(50).optional().allow(""),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
}

export default RegisterDto;
