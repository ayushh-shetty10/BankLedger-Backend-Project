require("dotenv").config();
const {app} = require("./src/app.js");
const {connectDb} = require("./src/db/db.js");


connectDb();




app.listen(4000,()=>{
    console.log(`Server is running on port 4000`);
});