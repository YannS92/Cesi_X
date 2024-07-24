const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dataSchema = new schema({
    filename: {
        type: String,
        required: true
    },
    file: {
        type: Buffer,
        required: true
    }
});

const Data = mongoose.model("Data", dataSchema);
module.exports = Data;