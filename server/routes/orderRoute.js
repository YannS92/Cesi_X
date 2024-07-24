const express = require('express');
const orderRoute = express.Router();
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const User = require('../models/user');
const Article = require('../models/article');
const Restaurant = require('../models/restaurant');
const Menu = require('../models/menu');
const isAuth = require("../middleware/passport");
const checkRole = require("../middleware/checkRole");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

orderRoute.post('/add', async (req, res) => {
    const { orderaddress, orderPhone, userId, Articles, Menus, referralCode } = req.body; // Removed DeliveryPersonId

    try {
        let allItemsExist = true;
        let totalOrderPrice = 0;
        const itemsByRestaurant = {};

        // Process articles
        for (const item of Articles) {
            const article = await Article.findById(item.articleId);
            if (!article || item.quantity <= 0) {
                allItemsExist = false;
                break;
            }

            const restaurantId = article.restaurantId;
            const articlePrice = article.price * item.quantity;
            totalOrderPrice += articlePrice;
            if (!itemsByRestaurant[restaurantId]) {
                itemsByRestaurant[restaurantId] = { articles: [], menus: [] };
            }

            const newArticle = {
                articleId: article._id,
                quantity: item.quantity
            };

            itemsByRestaurant[restaurantId].articles.push(newArticle);
        }

        // Process menus
        for (const menuItem of Menus) {
            const menu = await Menu.findById(menuItem.menuId).populate('articles');
            if (!menu || menuItem.quantityMenu <= 0) {
                allItemsExist = false;
                break;
            }

            const restaurantId = menu.restaurantId;
            const menuPrice = menu.price * menuItem.quantityMenu;
            totalOrderPrice += menuPrice;
            if (!itemsByRestaurant[restaurantId]) {
                itemsByRestaurant[restaurantId] = { articles: [], menus: [] };
            }

            const newMenu = {
                menuId: menu._id,
                quantityMenu: menuItem.quantityMenu,
                Articles: menu.articles.map(article => ({
                    articleId: article._id,
                    quantity: article.quantity ? article.quantity * menuItem.quantityMenu : 0
                }))
            };

            itemsByRestaurant[restaurantId].menus.push(newMenu);
        }

        if (allItemsExist) {
            const subOrders = [];
            for (const restaurantId in itemsByRestaurant) {
                const { articles, menus } = itemsByRestaurant[restaurantId];
                let subOrderPrice = 0;

                for (const article of articles) {
                    const articleData = await Article.findById(article.articleId);
                    subOrderPrice += articleData.price * article.quantity;
                }

                for (const menu of menus) {
                    const menuData = await Menu.findById(menu.menuId);
                    subOrderPrice += menuData.price * menu.quantityMenu;
                }

                const subOrder = new SubOrder({
                    restaurantId,
                    Articles: articles,
                    Menus: menus,
                    OrderPrice: subOrderPrice,
                    OrderStatus: "en cours"
                });

                await subOrder.save();

                const restaurant = await Restaurant.findById(restaurantId);
                if (!restaurant) {
                    throw new Error(`Restaurant with id ${restaurantId} not found`);
                }
                restaurant.subOrders.push(subOrder._id);
                await restaurant.save(); // Save the restaurant after adding the subOrder

                subOrders.push(subOrder);
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Apply referral discount if applicable
            let discountRate = 0;
            if (user.orders.length === 0 && user.referredBy && !user.hasUsedReferral) {
                discountRate = 0.10;
                user.hasUsedReferral = true;
                await user.save();

                const referrer = await User.findById(user.referredBy);
                if (referrer) {
                    referrer.hasUsedReferral = true;
                    await referrer.save();
                }
            }

            const originalOrderPrice = totalOrderPrice;
            if (discountRate > 0) {
                totalOrderPrice = totalOrderPrice * (1 - discountRate);
            }

            const newOrder = new Order({
                orderaddress,
                orderPhone,
                userId,
                Orders: subOrders.map(subOrder => ({
                    subOrderId: subOrder._id,
                    restaurantId: subOrder.restaurantId,
                    OrderPrice: subOrder.OrderPrice,
                    OrderStatus: subOrder.OrderStatus,
                    Articles: subOrder.Articles,
                    Menus: subOrder.Menus
                })),
                OrderPrice: totalOrderPrice,
                OriginalOrderPrice: originalOrderPrice,
                DiscountApplied: discountRate,
                OrderStatus: "en cours"
            });

            await newOrder.save();

            user.orders.push(newOrder._id);
            await user.save();

            const orderWithDetails = await Order.findById(newOrder._id)
                .populate({
                    path: 'Orders.subOrderId',
                    populate: [
                        { path: 'Articles.articleId', model: 'Article' },
                        { path: 'Menus.menuId', model: 'Menu' },
                        { path: 'Menus.Articles.articleId', model: 'Article' }
                    ]
                })
                .lean();

            res.status(201).json({ message: "Commande ajoutée avec succès", order: orderWithDetails });
        } else {
            res.status(400).json({ error: 'At least one of the articles or menus does not exist or has an invalid quantity' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


orderRoute.post('/apply-referral', isAuth(), async (req, res) => {
    const { orderId, referralCode } = req.body;

    try {
        if (!orderId || !referralCode) {
            return res.status(400).json({ message: 'Order ID and referral code are required' });
        }

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure the order status is 'en cours'
        if (order.OrderStatus !== 'en cours') {
            return res.status(400).json({ message: 'Referral code can only be applied to orders in progress' });
        }

        // Find the user using the referral code
        const referrer = await User.findOne({ referralCode });
        if (!referrer) {
            return res.status(400).json({ message: 'Invalid referral code' });
        }

        // Check if the user has already used the referral code
        const user = await User.findById(order.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.orders.length > 0 || user.hasUsedReferral) {
            return res.status(400).json({ message: 'Referral code cannot be applied' });
        }

        // Apply discount
        const discountRate = 0.10;
        const discountedPrice = order.OrderPrice * (1 - discountRate);

        // Update user's referral usage
        user.hasUsedReferral = true;
        await user.save();

        // Update referrer's referral usage
        referrer.hasUsedReferral = true;
        await referrer.save();

        res.status(200).json({ success: true, discountedPrice });
    } catch (error) {
        console.error('Error applying referral code:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Supprimer une commande par ID
orderRoute.delete('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        // Trouver la commande à supprimer
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Supprimer la commande des sous-commandes associées
        const subOrderIds = deletedOrder.Orders.map(subOrder => subOrder.subOrderId);
        await SubOrder.deleteMany({ _id: { $in: subOrderIds } });

        // Supprimer la commande de l'utilisateur
        const user = await User.findOneAndUpdate(
            { orders: id },
            { $pull: { orders: id } },
            { new: true }
        );

        if (!user) {
            console.error('User not found');
            throw new Error('User not found or order not associated with user');
        }

        // Supprimer la commande des restaurants associés
        for (const subOrder of deletedOrder.Orders) {
            await Restaurant.findOneAndUpdate(
                { subOrders: subOrder.subOrderId },
                { $pull: { subOrders: subOrder.subOrderId } }
            );
        }

        res.status(200).json({ message: 'Order and associated sub-orders deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(400).json({ error: error.message });
    }
});
// Mettre à jour une commande par ID
orderRoute.put('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { orderaddress, orderPhone, userId, DeliveryPersonId, Orders, OrderStatus } = req.body;
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.orderaddress = orderaddress !== undefined ? orderaddress : order.orderaddress;
        order.orderPhone = orderPhone !== undefined ? orderPhone : order.orderPhone;
        order.userId = userId !== undefined ? userId : order.userId;
        order.DeliveryPersonId = DeliveryPersonId !== undefined ? DeliveryPersonId : order.DeliveryPersonId;
        order.Orders = Orders !== undefined ? Orders : order.Orders;
        order.OrderStatus = OrderStatus !== undefined ? OrderStatus : order.OrderStatus;

        await order.save();
        console.log('Updated order:', order);
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mettre à jour le status
orderRoute.put('/:id/status', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { OrderStatus } = req.body;
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        order.OrderStatus = OrderStatus !== undefined ? OrderStatus : order.OrderStatus;

        await order.save();
        console.log('Updated order:', order);
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// add menu by id 
orderRoute.post('/:idorder/menu/:idMenu', isAuth(), async (req, res) => {
    const { idorder, idMenu } = req.params;
    const { quantityMenu } = req.body;

    try {
        if (quantityMenu <= 0) {
            throw new Error('Quantity must be greater than zero');
        }

        const menu = await Menu.findById(idMenu).populate('articles');
        if (!menu) {
            throw new Error('Menu not found');
        }

        const order = await Order.findById(idorder);
        if (!order) {
            throw new Error('Order not found');
        }

        const menuTotalPrice = menu.price * quantityMenu;
        const restaurantId = menu.restaurantId;

        const orderIndex = order.Orders.findIndex(orderItem =>
            orderItem.restaurantId.toString() === restaurantId.toString()
        );

        if (orderIndex !== -1) {
            const menuIndex = order.Orders[orderIndex].Menus.findIndex(item => item.menuId.toString() === idMenu);

            if (menuIndex !== -1) {
                order.Orders[orderIndex].Menus[menuIndex].quantityMenu += quantityMenu;
            } else {
                order.Orders[orderIndex].Menus.push({ menuId: idMenu, quantityMenu: quantityMenu });
            }

            // Update the OrderPrice of the subOrder
            order.Orders[orderIndex].OrderPrice += menuTotalPrice;
        } else {
            // Create a new subOrder
            const newSubOrder = new SubOrder({
                restaurantId,
                Menus: [{ menuId: idMenu, quantityMenu: quantityMenu }],
                OrderPrice: menuTotalPrice,
                OrderStatus: "en cours"
            });

            await newSubOrder.save();

            const restaurant = await Restaurant.findById(restaurantId);
            if (!restaurant) {
                throw new Error(`Restaurant with id ${restaurantId} not found`);
            }
            restaurant.subOrders.push(newSubOrder._id);
            await restaurant.save();

            const newOrder = {
                subOrderId: newSubOrder._id,
                restaurantId: restaurantId,
                Menus: newSubOrder.Menus,
                OrderPrice: newSubOrder.OrderPrice,
                OrderStatus: newSubOrder.OrderStatus
            };
            order.Orders.push(newOrder);
        }

        order.OrderPrice = (order.OrderPrice || 0) + menuTotalPrice;

        await order.save();

        res.status(200).json({ message: 'Menu added/updated successfully', order });
    } catch (error) {
        console.error('Error adding/updating menu in order:', error);
        res.status(400).json({ error: error.message });
    }
});
// add article by id 
orderRoute.post('/:idorder/article/:idarticle', isAuth(), async (req, res) => {
    const { idorder, idarticle } = req.params;
    const { quantity } = req.body;

    try {
        if (quantity <= 0) {
            throw new Error('Quantity must be greater than zero');
        }

        const article = await Article.findById(idarticle);
        if (!article) {
            throw new Error('Article not found');
        }

        const order = await Order.findById(idorder);
        if (!order) {
            throw new Error('Order not found');
        }

        const articleTotalPrice = article.price * quantity;
        const restaurantId = article.restaurantId;

        const orderIndex = order.Orders.findIndex(orderItem =>
            orderItem.restaurantId.toString() === restaurantId.toString()
        );

        if (orderIndex !== -1) {
            const articleIndex = order.Orders[orderIndex].Articles.findIndex(item => item.articleId.toString() === idarticle);

            if (articleIndex !== -1) {
                order.Orders[orderIndex].Articles[articleIndex].quantity += quantity;
            } else {
                order.Orders[orderIndex].Articles.push({ articleId: idarticle, quantity: quantity });
            }

            // Update the OrderPrice of the subOrder
            order.Orders[orderIndex].OrderPrice += articleTotalPrice;
        } else {
            // Create a new subOrder
            const newSubOrder = new SubOrder({
                restaurantId,
                Articles: [{ articleId: idarticle, quantity: quantity }],
                OrderPrice: articleTotalPrice,
                OrderStatus: "en cours"
            });

            await newSubOrder.save();

            const restaurant = await Restaurant.findById(restaurantId);
            if (!restaurant) {
                throw new Error(`Restaurant with id ${restaurantId} not found`);
            }
            restaurant.subOrders.push(newSubOrder._id);
            await restaurant.save();

            const newOrder = {
                subOrderId: newSubOrder._id,
                restaurantId: restaurantId,
                Articles: newSubOrder.Articles,
                OrderPrice: newSubOrder.OrderPrice,
                OrderStatus: newSubOrder.OrderStatus
            };
            order.Orders.push(newOrder);
        }

        order.OrderPrice = (order.OrderPrice || 0) + articleTotalPrice;

        await order.save();

        res.status(200).json({ message: 'Article added/updated successfully', order });
    } catch (error) {
        console.error('Error adding/updating article in order:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete article in an order by ID
orderRoute.delete('/:idorder/article/:idarticle', isAuth(), async (req, res) => {
    const { idorder, idarticle } = req.params;

    try {
        const order = await Order.findById(idorder);
        if (!order) {
            throw new Error('Order not found');
        }

        const orderIndex = order.Orders.findIndex(orderItem => 
            orderItem.Articles.some(article => article.articleId.toString() === idarticle)
        );
        if (orderIndex === -1) {
            throw new Error('Order not found in order');
        }
        const articleIndex = order.Orders[orderIndex].Articles.findIndex(item => item.articleId.toString() === idarticle);
        if (articleIndex === -1) {
            throw new Error('Article not found in order');
        }

        const article = await Article.findById(idarticle);
        if (!article) {
            throw new Error('Article not found');
        }

        const quantity = order.Orders[orderIndex].Articles[articleIndex].quantity;
        const articleTotalPrice = article.price * quantity;

        if (quantity > 1) {
            order.Orders[orderIndex].Articles[articleIndex].quantity--;
            order.OrderPrice = (order.OrderPrice) - article.price;
        } else {
            order.Orders[orderIndex].Articles.splice(articleIndex, 1);
            order.OrderPrice = (order.OrderPrice || 0) - articleTotalPrice;

            if (order.Orders[orderIndex].Articles.length === 0) {
                order.Orders.splice(orderIndex, 1);
            }
        }

        await order.save();

        console.log('Order after update:', order);
        res.status(200).json({ message: 'Article deleted successfully', order });
    } catch (error) {
        console.error('Error deleting article from order:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get an order by subOrder ID
orderRoute.get('/suborder/:subOrderId', async (req, res) => {
    const { subOrderId } = req.params;
    try {
        const order = await Order.findOne({ 'Orders.subOrderId': subOrderId }).populate('Orders.subOrderId');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


orderRoute.post('/:orderId/menu/:menuId', async (req, res) => {
    const { orderId, menuId } = req.params;
    const { quantityMenu } = req.body;

    if (!quantityMenu) {
        return res.status(400).json({ error: 'quantityMenu is required' });
    }

    try {
        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Find the menu
        const menu = await Menu.findById(menuId);
        if (!menu) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        // Ensure quantity is valid
        if (quantityMenu <= 0) {
            return res.status(400).json({ error: 'Invalid quantity for menu' });
        }

        // Find the corresponding subOrder for the restaurant
        const restaurantId = menu.restaurantId;
        let subOrder = order.Orders.find(subOrder => subOrder.restaurantId.toString() === restaurantId.toString());

        // If no subOrder exists for the restaurant, create a new one
        if (!subOrder) {
            subOrder = new SubOrder({
                restaurantId,
                Articles: [],
                Menus: [],
                OrderPrice: 0,
                OrderStatus: "en cours"
            });
            order.Orders.push(subOrder);
        }

        // Check if the menu already exists in the subOrder
        let existingMenu = subOrder.Menus.find(m => m.menuId.toString() === menuId);

        if (existingMenu) {
            // If the menu exists, increase the quantity
            existingMenu.quantityMenu += quantityMenu;
        } else {
            // If the menu does not exist, add it to the subOrder
            const newMenu = {
                menuId: menu._id,
                quantityMenu,
                Articles: menu.articles.map(article => ({
                    articleId: article._id,
                    quantity: article.quantity ? article.quantity * quantityMenu : 0
                }))
            };

            subOrder.Menus.push(newMenu);
        }

        // Recalculate subOrder price
        subOrder.OrderPrice += menu.price * quantityMenu;

        // Save the order
        await order.save();

        res.status(200).json({ message: 'Menu added to order successfully', order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Define the route for fetching all orders before any parameterized route
orderRoute.get('/all-orders', isAuth(), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'Orders.subOrderId',
                populate: [
                    { path: 'Articles.articleId', model: 'Article' },
                    { path: 'Menus.menuId', model: 'Menu' },
                    { path: 'Menus.Articles.articleId', model: 'Article' }
                ]
            })
            .lean();
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

orderRoute.put('/validate-delivery/:subOrderId', isAuth(), async (req, res) => {
    const { subOrderId } = req.params;

    try {
        if (!subOrderId) {
            return res.status(400).json({ message: 'SubOrder ID is required' });
        }
        const subOrder = await SubOrder.findById(subOrderId);
        if (!subOrder) {
            return res.status(404).json({ message: 'SubOrder not found' });
        }

        if (subOrder.OrderStatus !== 'accepted') {
            return res.status(400).json({ message: 'Only subOrders with status "accepted" can be validated for delivery' });
        }
        subOrder.OrderStatus = 'in delivery';
        await subOrder.save();

        const parentOrder = await Order.findOne({ 'Orders.subOrderId': subOrderId });
        if (parentOrder) {
            const subOrderToUpdate = parentOrder.Orders.find(o => o.subOrderId.toString() === subOrderId);
            if (subOrderToUpdate) {
                subOrderToUpdate.OrderStatus = 'in delivery';
                await parentOrder.save();
            }
        }

        res.status(200).json({ success: true, message: 'SubOrder validated for delivery successfully' });
    } catch (error) {
        console.error('Error validating subOrder for delivery:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

orderRoute.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id)
            .populate({
                path: 'Orders.subOrderId',
                populate: [
                    { path: 'Articles.articleId', model: 'Article' },
                    { path: 'Menus.menuId', model: 'Menu' },
                    { path: 'Menus.Articles.articleId', model: 'Article' } 
                ]
            })
            .lean();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


orderRoute.put('/accept-suborder/:subOrderId', isAuth(), async (req, res) => {
    const { subOrderId } = req.params;
    
    try {
        if (!subOrderId) {
            return res.status(400).json({ message: 'SubOrder ID is required' });
        }

        // Find the subOrder by ID
        const subOrder = await SubOrder.findById(subOrderId);
        if (!subOrder) {
            return res.status(404).json({ message: 'SubOrder not found' });
        }

        // Ensure the subOrder status is 'en cours'
        if (subOrder.OrderStatus !== 'en cours') {
            return res.status(400).json({ message: 'Only subOrders with status "en cours" can be accepted' });
        }

        // Update subOrder status to 'accepted'
        subOrder.OrderStatus = 'accepted';
        await subOrder.save();

        // Optionally update the parent order's status if needed
        const parentOrder = await Order.findOne({ 'Orders.subOrderId': subOrderId });
        if (parentOrder) {
            const subOrderToUpdate = parentOrder.Orders.find(o => o.subOrderId.toString() === subOrderId);
            if (subOrderToUpdate) {
                subOrderToUpdate.OrderStatus = 'accepted';
                await parentOrder.save();
            }
        }

        res.status(200).json({ success: true, message: 'SubOrder accepted successfully' });
    } catch (error) {
        console.error('Error accepting subOrder:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

orderRoute.put('/assign-delivery-person/:orderId', isAuth(), async (req, res) => {
    const { orderId } = req.params;
    const { DeliveryPersonId } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.DeliveryPersonId = DeliveryPersonId;
        await order.save();

        res.status(200).json({ message: 'Delivery person assigned successfully', order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Accept an order as a delivery person
orderRoute.put('/accept-order/:orderId', isAuth(), async (req, res) => {
    const { orderId } = req.params;

    try {
        console.log(`Accepting order with ID: ${orderId}`);
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log(`Order Status before accepting: ${order.OrderStatus}`);

        if (order.OrderStatus !== 'payé') { // Assuming 'pending' is the initial state
            return res.status(400).json({ error: 'Order can only be accepted if it is pending' });
        }

        order.OrderStatus = 'accepted by deliveryPerson';
        await order.save();

        res.status(200).json({ message: 'Order accepted successfully', order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Reject an order as a delivery person
orderRoute.put('/reject-order/:orderId', isAuth(), async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.DeliveryPersonId = null;
        await order.save();

        res.status(200).json({ message: 'Order rejected successfully', order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove delivery person from order
orderRoute.put('/remove-delivery-person/:orderId', isAuth(), async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const deliveryPersonId = order.DeliveryPersonId;
        order.DeliveryPersonId = null;
        await order.save();

        // Update delivery person's availability
        if (deliveryPersonId) {
            const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);
            if (deliveryPerson) {
                deliveryPerson.available = true;
                await deliveryPerson.save();
            }
        }

        res.status(200).json({ message: 'Delivery person removed from order successfully', order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update order status to delivered
orderRoute.put('/set-delivered/:orderId', isAuth(), async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.OrderStatus = 'delivered';
        await order.save();

        res.status(200).json({ message: 'Order status set to delivered', order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update order status to picked up
orderRoute.put('/set-picked-up/:orderId', isAuth(), async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.OrderStatus = 'picked up';
        await order.save();

        res.status(200).json({ message: 'Order status set to picked up', order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = orderRoute;
