import Joi from "joi"
class BaseDto {
    static schema = Joi.object({})
    static validate(data) {
        const { error, value } = this.schema.validate(data)
        if (error) {
            const err = error.details.map(er => er.message).join(",")
            return { error: err, value: null }
        }
        return { error: null, value: value }
    }
}
export default BaseDto