const httpStatus = require("http-status")
const { UserModel, ProfileModel } = require("../models")
const ApiError = require("../utils/ApiError")
const { generatoken } = require("../utils/Token.utils")
const axios = require("axios");

class AuthService {
    static async findUserByEmail(email) {
        return await UserModel.findOne({ email });
    }

    static async RegisterUser(body) {
        const { email, password, name, token, provider, isSocialLogin } = body;
        console.log('Register attempt:', { email, provider, isSocialLogin }); // Add logging

        // Skip reCAPTCHA for social login
        if (!isSocialLogin) {
            const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, {}, {
                params: {
                    secret: process.env.CAPTCHA_SCREATE_KEY,
                    response: token,
                }
            });

            const data = await response.data;
            if (!data.success) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Captcha Not Valid")
            }
        }

        const checkExist = await UserModel.findOne({ email })
        if (checkExist) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User Already Registered")
        }

        const user = await UserModel.create({
            email,
            password: isSocialLogin ? undefined : password,
            name,
            provider: provider || 'email'
        })

        const tokend = generatoken(user)
        const refresh_token = generatoken(user, '2d')
        await ProfileModel.create({
            user: user._id,
            refresh_token
        })

        return {
            msg: "User Register Successfully",
            token: tokend,
            user
        }
    }

    static async LoginUser(body) {
        const { email, password, token, provider, isSocialLogin } = body;
        console.log('Login attempt:', { email, provider, isSocialLogin }); // Add logging

        // Skip reCAPTCHA for social login
        if (!isSocialLogin) {
            const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, {}, {
                params: {
                    secret: process.env.CAPTCHA_SCREATE_KEY,
                    response: token,
                }
            });

            const data = await response.data;
            if (!data.success) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Captcha Not Valid")
            }
        }

        const checkExist = await UserModel.findOne({ email })
        console.log('User found:', checkExist); // Add logging

        if (!checkExist) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User Not Registered")
        }

        // Skip password check for social login
        if (!isSocialLogin && password !== checkExist.password) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Credentials")
        }

        // Verify the provider matches for social login
        if (isSocialLogin && checkExist.provider !== provider) {
            console.log('Provider mismatch:', { expected: checkExist.provider, received: provider });
            throw new ApiError(httpStatus.BAD_REQUEST, "Please use the same login method you used when registering")
        }

        const tokend = generatoken(checkExist)
        console.log('Login successful, token generated'); // Add logging

        return {
            msg: "User Login Successfully",
            token: tokend,
            user: {
                id: checkExist._id,
                email: checkExist.email,
                name: checkExist.name,
                provider: checkExist.provider
            }
        }
    }

    static async ProfileService(user) {
        const checkExist = await UserModel.findById(user).select("name email provider")
        if (!checkExist) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User Not Registered")
            return
        }

        return {
            msg: "Data fetched",
            user: checkExist
        }
    }

    static async SocialLoginUser(body) {
        const { email, provider } = body;

        const checkExist = await UserModel.findOne({ email })
        if (!checkExist) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User Not Registered")
        }

        const tokend = generatoken(checkExist)

        return {
            msg: "User Login Successfully",
            token: tokend,
            user: checkExist
        }
    }

    static async SocialRegisterUser(body) {
        const { email, name, provider } = body;

        const checkExist = await UserModel.findOne({ email })
        if (checkExist) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User Already Registered")
        }

        const user = await UserModel.create({
            email,
            name,
            provider: provider || 'google',
            isSocialLogin: true
        })

        const tokend = generatoken(user)
        const refresh_token = generatoken(user, '2d')
        await ProfileModel.create({
            user: user._id,
            refresh_token
        })

        return {
            msg: "User Register Successfully",
            token: tokend,
            user
        }
    }
}

module.exports = AuthService