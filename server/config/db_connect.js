const mongoose = require("mongoose");
require("dotenv").config();

const db_connect = async () => {
    try {
        const result = await mongoose.connect(
            process.env.MONGO_URI
        );
        console.log("database is connected");
    } catch (error) {
       // console.log(error)
        console.log("database is not connected");
        console.log(error)
    }
}

module.exports = db_connect;