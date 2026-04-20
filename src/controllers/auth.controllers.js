const {userModel} = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const {sendRegEmail} = require("../services/email.service.js");
const tokenBlacklistModel = require("../models/tokenBlacklist.model.js");


/** 
 * -user register controller
 * -POST /api/auth/register
 */
const registerUser = async(req,res)=>{
    const {email,name,password}=req.body;

    const emailAlrExists = await userModel.findOne({
        email
    })

    if(emailAlrExists){
        return res.status(422).json({
            message:"email already exists"
        })
    }

    const user = await userModel.create({
        email,
        name,
        password
    })

    const token = jwt.sign({
        Id:user._id,

    },process.env.JWT_SECRET_KEY,{
        expiresIn:"7d",
    });

    res.cookie("token",token); 



    res.status(201).json({
        message:"user registered successfully",
        user:{
            id:user._id,
            email:user.email,
            name:user.name,
        },
        token

    })
    await sendRegEmail(user.email,user.name);

}

/**
 * -user login controller
 * -POST /api/auth/login
 */
const loginUser = async function (req,res){
    const {email,name,password}=req.body;

    if((!email && !name) || !password){
        return res.status(402).json({
            message:"Please Enter Email/Username and Password"
        })
    }

    const user = await userModel.findOne({
        $or:[{name},{email}]
    }).select("+password");

    if(!user){
        return res.status(401).json({
            message:"User Doesn't exists"
        })
    }

    const isPasswordRight = await user.comparePassword(password);

    if(!isPasswordRight){
        return res.status(401).json({
            message:"Invalid Password"
        })
    }

    const token = jwt.sign({
        Id:user._id,
    },process.env.JWT_SECRET_KEY,{
        expiresIn:"7d",
    })

    res.cookie("token",token);

    return res.status(200).json({
        message:"User Logged in successfully",
        user:{
            id:user._id,
            email:user.email,
            name:user.name,
        },
        token,
    })

    
}

/**
 * -user logout controller
 * -POST /api/auth/logout
 */
const logoutUser = async function(req,res){
    const token = req.cookies.token|| req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(200).json({
            message:"User logged out successfully"
        })
    }

    const blackListToken = await tokenBlacklistModel.create({
        token,
    })

    res.clearCookie("token");

    return res.status(200).json({
        message:"User logged out successfully"
    })
}

module.exports = {registerUser,loginUser,logoutUser};