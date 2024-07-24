const mongoose = require("mongoose");
const schema = mongoose.Schema;

const restaurantSchema = new schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }], // Array of article references
    menus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }], // Array of menu references
    ratings: [{ type: Number }], // Array to store user ratings
    workingHours: { type: String, required: true }, // String to store working hours
    category: { type: String, required: true }, // Added category field
    img: { type: String }, // Image URL
    imgPublicId: { type: String }, // Public ID for Cloudinary
    subOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder' }]
});

// Method to get the restaurant's name
restaurantSchema.methods.getName = function() {
    return this.name;
};

// Method to get the restaurant's address
restaurantSchema.methods.getAddress = function() {
    return this.address;
};

// Method to get the restaurant's phone number
restaurantSchema.methods.getPhone = function() {
    return this.phone;
};

// Method to get the restaurant's email
restaurantSchema.methods.getEmail = function() {
    return this.email;
};

// Method to get the restaurant's owner ID
restaurantSchema.methods.getOwnerId = function() {
    return this.ownerId;
};

// Method to add a rating
restaurantSchema.methods.addRating = async function(rating) {
    try {
        this.ratings.push(rating);
        await this.save();
        return this;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Method to calculate the average rating
restaurantSchema.methods.getAverageRating = function() {
    const sum = this.ratings.reduce((a, b) => a + b, 0);
    return (this.ratings.length === 0) ? 0 : (sum / this.ratings.length).toFixed(2);
};

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
