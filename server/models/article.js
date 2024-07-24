const mongoose = require("mongoose");
const schema = mongoose.Schema;

const articleSchema = new schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, required: true } ,// Added category field
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    img: { type: String }, // Image URL
    imgPublicId: { type: String } // Public ID for Cloudinary
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;

// Function to get the name of the article
articleSchema.methods.getName = function() {
    return this.name;
};

// Function to get the price of the article
articleSchema.methods.getPrice = function() {
    return this.price;
};

// Function to get the description of the article
articleSchema.methods.getDescription = function() {
    return this.description;
};

// Function to get the restaurantId of the article
articleSchema.methods.getRestaurantId = function() {
    return this.restaurantId;
};

// Function to get the category of the article
articleSchema.methods.getCategory = function() {
    return this.category;
};
