const mongoose = require("mongoose");
const schema = mongoose.Schema;

const deliveryPersonSchema = new schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleDetails: { type: String, required: true },
    available: { type: Boolean, default: true }
});

const DeliveryPerson = mongoose.model("DeliveryPerson", deliveryPersonSchema);
module.exports = DeliveryPerson;

//fonction pour recup le userId du deliveryPerson
deliveryPersonSchema.methods.getUserId = function() {
    return this.userId;
};
//fonction pour recup le détaille du véhicule du deliveryPerson
deliveryPersonSchema.methods.getVehicleDetails = function() {
    return this.vehicleDetails;
};
//fonction pour recup la disponibilité du deliveryPerson
deliveryPersonSchema.methods.getAvailable = function() {
    return this.available;
};
/* fonction pour trouver les infos de la commande
articleSchema.statics.findByRestaurantId = async function(restaurantId) {
    try {
        const articles = await articleRoutes.findByRestaurantId(restaurantId);
        return articles;
    } catch (error) {
        throw new Error(error.message);
    }
};*/