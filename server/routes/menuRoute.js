const express = require('express');
const menuRoute = express.Router();
const Menu = require('../models/menu');
const Article = require('../models/article');
const Restaurant = require('../models/restaurant');
const isAuth = require("../middleware/passport");
const checkRole = require("../middleware/checkRole");

menuRoute.post('/', isAuth(), async (req, res) => {
    const { name, price, description, articles, restaurantId } = req.body;
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(400).json({ error: "Restaurant not found" });
        }

        for (const articleId of articles) {
            const article = await Article.findById(articleId);
            if (!article) {
                return res.status(400).json({ error: `Article with ID ${articleId} not found` });
            }
        }

        const newMenu = new Menu({ name, price, description, articles, restaurantId });
        await newMenu.save();

        restaurant.menus.push(newMenu._id);
        await restaurant.save();

        res.status(201).json(newMenu);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

menuRoute.put('/:id', isAuth(), checkRole(['restaurantOwner', 'admin']), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, articles } = req.body;

    try {
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }

        if (articles) {
            for (const articleId of articles) {
                const article = await Article.findById(articleId);
                if (!article) {
                    return res.status(400).json({ error: `Article with ID ${articleId} not found` });
                }
            }
            menu.articles = articles;
        }

        menu.name = name !== undefined ? name : menu.name;
        menu.price = price !== undefined ? price : menu.price;
        menu.description = description !== undefined ? description : menu.description;

        await menu.save();

        res.status(200).json(menu);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

menuRoute.get('/restaurant/:restaurantId', isAuth(), async (req, res) => {
    const { restaurantId } = req.params;
    try {
        const menus = await Menu.find({ restaurantId }).populate('articles');
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

menuRoute.get('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await Menu.findById(id).populate('articles');
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

menuRoute.delete('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await Menu.findByIdAndDelete(id);
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }
        res.status(200).json({ message: "Menu deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = menuRoute;
