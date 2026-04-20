const express = require("express");
const { authMiddleware,authSystemMiddleware } = require("../middlewares/auth.middleware");
const {createTransaction, createInitialFund} = require("../controllers/transaction.controllers.js");


const router = express.Router();

router.post("/",authMiddleware,createTransaction);

router.post("/system/deposit",authSystemMiddleware,createInitialFund);

module.exports=router;