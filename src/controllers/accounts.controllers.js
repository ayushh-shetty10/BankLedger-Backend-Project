const {accountModel} = require("../models/account.model.js");

/**
 *-create account controller
 *-POST /api/accounts/
 */
const createAccount = async function(req,res){

    const user = req.user;

    const account = await accountModel.create({
        user:user._id,
    })

    return res.status(201).json({
        message:"Account created successfully",
        account,
    })
}

/**
 *-get the loggedIn user's all accounts controller
 *-GET /api/accounts/
 */
const getUsersAllAccs = async function(req,res){
    const accounts = await accountModel.find({
        user:req.user._id
    })

    return res.status(201).json({
        accounts,
    })
}


/**
 * -Get Balance of user's account 
 * -using accountId from req.param
 * -GET /api/accounts/getbalance/:accountId
 */
const getAccountBalance = async function(req,res){
    const {accountId} = req.params;
    //check if accountId is valid or not and if it belongs to the user or not
    const account = await accountModel.findOne({
        _id:accountId,
        user:req.user._id
    })

    if(!account){
        return res.status(400).json({
            message:"Invalid Account ID or Account does not belong to the user"
        })
    }

    const balance =await  account.GetBalance();

    return res.status(200).json({
        accountId:account._id,
        balance,
    });
}

module.exports = {createAccount,getUsersAllAccs,getAccountBalance}