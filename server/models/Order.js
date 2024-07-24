const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderaddress: { type: String, required: true },
    orderPhone: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    DeliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson' }, // Made optional
    Orders: [{
        subOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder', required: true },
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        Articles: [{
            articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
            quantity: { type: Number, required: true }
        }],
        Menus: [{
            menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
            Articles: [{
                articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
                quantity: { type: Number, required: true }
            }],
            quantityMenu: { type: Number, required: true }
        }],
        OrderPrice: { type: Number, required: true },
        OrderStatus: { type: String, required: true }
    }],
    OrderPrice: { type: Number, required: true },
    OriginalOrderPrice: { type: Number, required: true }, // New field for original price
    DiscountApplied: { type: Boolean, required: true }, // New field to indicate if discount was applied
    OrderStatus: { type: String, required: true }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
