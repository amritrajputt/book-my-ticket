import BaseDto from "./BaseDto.js";
import Joi from "joi";

class LoginDto extends BaseDto {
  static schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
}

export default LoginDto;
