const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Account is required for creating a ledger entry"],
        index:true,
        immutable:true,
    },
    amount : {
        type:Number,
        required:[true,"Amount is required for creating a ledger entry"],
        immutable:true,
    },
    transaction : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Transaction is required for creating a ledger entry"],
        index:true,
        immutable:true,
    },
    type:{
        type:String,
        enum : {
            values:["DEBIT","CREDIT"],
            message:"Type must be either DEBIT or CREDIT",
        },
        required:[true,"Type is required for creating a ledger entry"],
        immutable:true,
    }
})

function preventLedgerModification (){
    throw new Error("Ledger Entries are immutable and cannot be modified or deleted");
}

transactionSchema.pre("updateOne",preventLedgerModification);
transactionSchema.pre("deleteOne",preventLedgerModification);
transactionSchema.pre("findOneAndUpdate",preventLedgerModification);
transactionSchema.pre("findOneAndDelete",preventLedgerModification);
transactionSchema.pre("remove",preventLedgerModification);
transactionSchema.pre("deleteMany",preventLedgerModification);
transactionSchema.pre("updateMany",preventLedgerModification);
transactionSchema.pre("findOneAndReplace",preventLedgerModification);


const ledgerModel = mongoose.model("ledger",transactionSchema);

module.exports = {ledgerModel}




