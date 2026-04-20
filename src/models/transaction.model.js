const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"From account is required for creating a transaction"],
        index:true,
    },
    toAccount : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"To account is required for creating a transaction"],
        index:true,
    },
    status:{
        type:String,
        enum : {
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"Status must be either PENDING, COMPLETED, FAILED, or REVERSED",
        },
        default:"PENDING",
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a transaction"],
        min:[0.01,"Amount must be at least 0.01"],
    },
    idempotencyKey : {
        type : String,
        required:[true,"Idempotency key is required for creating a transaction"],
        unique:true,
        index : true,
    }
},{
    timestamps:true,
})

const transactionModel = mongoose.model("transaction",transactionSchema)

module.exports = {transactionModel}