const { body } = require("express-validator")

class AuthValidation {
    static RegisterUser = [
        body("email").isEmail().withMessage("email must be valid").notEmpty().withMessage("email can not be empty"),
        body("name").notEmpty().withMessage("name can not be empty"),
        body("provider").optional(),
        body("isSocialLogin").optional().isBoolean(),
        body().custom((value, { req }) => {
            if (!req.body.isSocialLogin) {
                if (!req.body.token) {
                    throw new Error("token is Required for email registration");
                }
                if (!req.body.password || req.body.password.length < 6) {
                    throw new Error("password must be at least 6 characters for email registration");
                }
            }
            return true;
        })
    ]

    static LoginUser = [
        body("email").isEmail().withMessage("email must be valid").notEmpty().withMessage("email can not be empty"),
        body("provider").optional(),
        body("isSocialLogin").optional().isBoolean(),
        body().custom((value, { req }) => {
            if (!req.body.isSocialLogin) {
                if (!req.body.token) {
                    throw new Error("token is Required for email login");
                }
                if (!req.body.password || req.body.password.length < 6) {
                    throw new Error("password must be at least 6 characters for email login");
                }
            }
            return true;
        })
    ]
}

module.exports = AuthValidation