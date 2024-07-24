const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subOrderSchema = new Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    Articles: [{
        articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
        quantity: { type: Number, required: true }
    }],
    Menus: [{
        menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
        quantityMenu: { type: Number, required: true },
        Articles: [{
            articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
            quantity: { type: Number, required: true }
        }]
    }],
    OrderPrice: { type: Number, required: true },
    OrderStatus: { type: String, required: true}
});

const SubOrder = mongoose.model('SubOrder', subOrderSchema);

module.exports = SubOrder;
