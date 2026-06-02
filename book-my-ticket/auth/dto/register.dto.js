import Joi from "joi";

const registerSchema = Joi.object({
    firstName : Joi.string().required().min(3).max(20),
    lastName : Joi.string().required().min(3).max(20),
    email : Joi.string().email().required(),
    password : Joi.string().required().min(6).max(20)
})