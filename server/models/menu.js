const mongoose = require("mongoose");
const schema = mongoose.Schema;

const menuSchema = new schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }], // Array of article references
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
});

const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;
