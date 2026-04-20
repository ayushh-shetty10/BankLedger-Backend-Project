const mongoose = require("mongoose");
const { ledgerModel } = require("./ledger.model.js");

const accountSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"User is required for creating an account"],
        index:true,
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"Status must be either ACTIVE, FROZEN, or CLOSED",
           
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true,"Currency is required for creating an account"],
        default:"INR"
    }
},{
    timestamps:true,
})

accountSchema.index({user:1,status:1}) //Compound Index

accountSchema.methods.GetBalance = async function() {

    const calcBalance = await ledgerModel.aggregate([
        {
            $match:{
                account:this._id,
            },
        },
        {
            $group : {
                _id:null,
                TotalDebit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type","DEBIT"]},
                            "$amount",
                            0,
                        ]
                    }
                },
                TotalCredit:{
                    $sum :{
                        $cond:[
                            {$eq:["$type","CREDIT"]},
                            "$amount",
                            0,
                        ]
                    }
                }
            }
        },
        {
            $project : {
                _id:0,
                balance:{$subtract:["$TotalCredit","$TotalDebit"]},
            }
        }
    ])

    if(calcBalance.length === 0 ){
        return 0;
    }

    return calcBalance[0].balance;
}


const accountModel = mongoose.model("account",accountSchema);

module.exports = {accountModel};