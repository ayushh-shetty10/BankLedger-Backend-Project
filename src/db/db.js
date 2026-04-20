const mongoose = require("mongoose");

const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI).then(()=>{
            console.log("Connected to DB!");
        });
    } catch (error) {
        console.log("Could not connect to DB");
        process.exit(1);
    }
}

module.exports = {connectDb};