const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { createAccount ,getUsersAllAccs, getAccountBalance} = require("../controllers/accounts.controllers");




const router = express.Router();



router.post("/",authMiddleware,createAccount);

router.get("/",authMiddleware,getUsersAllAccs);

router.get("/getbalance/:accountId",authMiddleware,getAccountBalance);

module.exports=router;