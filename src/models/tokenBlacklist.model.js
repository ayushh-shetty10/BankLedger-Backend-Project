const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
   token:{
    type:String,
    required:[true,"Token is required to blacklist"],
    unique:[true,"Token is already blacklisted."]
   } 
},{
    timestamps:true
})

//None of the tokens are created forever, they expire after a while so no point in keeping them in blacklist also forever, so we delete them after some time.
tokenBlacklistSchema.index({createdAt:1},{
    expireAfterSeconds:60*60*24*3 // 3days
})

const tokenBlacklistModel = mongoose.model("TokenBlacklist",tokenBlacklistSchema);

module.exports = tokenBlacklistModel;