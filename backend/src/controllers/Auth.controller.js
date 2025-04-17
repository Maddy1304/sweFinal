const httpStatus = require("http-status");
const AuthService = require("../services/Auth.service")
const CatchAsync = require("../utils/CatchAsync")

class AuthController {
    static RegisterUser = CatchAsync(async(req,res)=>{
        const res_obj = await AuthService.RegisterUser(req.body);
        res.status(httpStatus.CREATED).send(res_obj)
    }) 

    static LoginUser = CatchAsync(async(req,res)=>{
        const res_obj = await AuthService.LoginUser(req.body);
        res.status(httpStatus.OK).send(res_obj)
    })

    static SocialLoginUser = CatchAsync(async(req,res)=>{
        const res_obj = await AuthService.SocialLoginUser(req.body);
        res.status(httpStatus.OK).send(res_obj)
    })

    static SocialRegisterUser = CatchAsync(async(req,res)=>{
        const res_obj = await AuthService.SocialRegisterUser(req.body);
        res.status(httpStatus.CREATED).send(res_obj)
    })

    static ProfileController = CatchAsync(async(req,res)=>{
        const res_obj = await AuthService.ProfileService(req.user);
        res.status(httpStatus.OK).send(res_obj)
    })

    // Add new method for social login
    static findOrCreateSocialUser = CatchAsync(async(userData) => {
        // First try to find the user
        let user = await AuthService.findUserByEmail(userData.email);
        
        if (!user) {
            // If user doesn't exist, create a new one
            const socialUserData = {
                email: userData.email,
                name: userData.name,
                provider: userData.provider,
                isEmailVerified: true, // Since it's verified by the provider
                password: Math.random().toString(36).slice(-8) // Generate random password
            };
            
            user = await AuthService.RegisterUser(socialUserData);
        }
        
        return user;
    })
}

module.exports = AuthController