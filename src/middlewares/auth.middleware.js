const tokenBlacklistModel = require("../models/tokenBlacklist.model.js");
const { userModel } = require("../models/user.model.js");
const jwt = require("jsonwebtoken");


const authMiddleware = async function(req,res,next){
    const token = req.cookies.token|| req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message:"User Unauthorized,token is missing"
        })
    }

    const isBlackListed = await tokenBlacklistModel.find({
        token,
    })

    if(isBlackListed){
        return res.status(401).json({
            message:"Unauthorized access,Token is Invalid",
        })
    }

    try{ 
        const decoded =  jwt.verify(token,process.env.JWT_SECRET_KEY);
        const user = await userModel.findOne( {_id:decoded.Id});
        req.user = user;

        return next();

    }catch(error){
        return res.status(401).json({
            message:"Token is Invalid",
        })
    }
   
};

const authSystemMiddleware = async function(req,res,next){
    const token = req.cookies.token|| req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message:"User Unauthorized,token is missing"
        })
    }

    const isBlackListed = await tokenBlacklistModel.find({
        token,
    })

    if(isBlackListed){
        return res.status(401).json({
            message:"Unauthorized access,Token is Invalid",
        })
    }

    try{ 
        const decoded =  jwt.verify(token,process.env.JWT_SECRET_KEY);
        const user = await userModel.findOne( {_id:decoded.Id}).select("+systemUser");

        if(!user.systemUser ){
            return res.status(403).json({
                message:"Unauthorized Access!- Forbidden",
            })
        }
        req.user = user;

        return next();

    }catch(error){
        return res.status(401).json({
            message:"Token is Invalid",
        })
    }
   
};


module.exports = {authMiddleware,authSystemMiddleware}