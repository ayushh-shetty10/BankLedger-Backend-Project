const express = require("express");
const authRouter = require("./routes/auth.route.js");
const cookieParser = require("cookie-parser");
const accountsRouter = require("./routes/account.routes.js")
const transactionRouter = require("./routes/transaction.routes.js");

const app = express();

app.use(express.json());
app.use(cookieParser());

//dummy api to check if server is live or not
app.get("/",(req,res)=>{
    res.send("Ledger Server is live and running");
})

app.use("/api/auth",authRouter);
app.use("/api/accounts",accountsRouter)
app.use("/api/transaction",transactionRouter)



module.exports={app};