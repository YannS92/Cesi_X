const express = require('express');
const articleRoute = express.Router();
const Article = require('../models/article');
const Menu = require('../models/menu'); // Import the Menu model
const Restaurant = require('../models/restaurant');
const isAuth = require("../middleware/passport");
const checkRole = require("../middleware/checkRole");

const multer = require("multer");
const cloudinary = require("../config/cloudinary"); // Import your cloudinary configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new article
articleRoute.post('/add', async (req, res) => {
    const { name, price, description, restaurantId, category } = req.body; // Include category in the request body
    try {
        const newArticle = new Article({ name, price, description, restaurantId, category }); // Add category to the new article
        await newArticle.save();

        // Add the article to the restaurant's articles array
        const restaurant = await Restaurant.findById(restaurantId);
        restaurant.articles.push(newArticle._id);
        await restaurant.save();

        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Upload article image
articleRoute.post('/upload-image/:id', isAuth(), upload.single("img"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const article = await Article.findById(req.params.id);
        if (article.imgPublicId) {
            // Delete the old image from Cloudinary
            await cloudinary.uploader.destroy(article.imgPublicId);
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });

        // Update article with image URL and public ID
        article.img = uploadResult.secure_url;
        article.imgPublicId = uploadResult.public_id;
        await article.save();

        res.send({ article, msg: "Image uploaded successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Find an article by name
articleRoute.get('/name/:name', isAuth(), async (req, res) => {
    const { name } = req.params;
    try {
        const article = await Article.findOne({ name });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Find articles by IDs
articleRoute.get('/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const articles = await Article.findById(id);
        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Find articles by restaurant ID
articleRoute.get('/restaurant/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;
    try {
        const articles = await Article.find({ restaurantId });
        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update an article by ID
articleRoute.put('/:id', isAuth(), checkRole(['restaurantOwner', 'admin']), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category } = req.body;
    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        article.name = name !== undefined ? name : article.name;
        article.price = price !== undefined ? price : article.price;
        article.description = description !== undefined ? description : article.description;
        article.category = category !== undefined ? category : article.category;

        await article.save();
        console.log('Updated article:', article); // Log the updated article
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete an article by ID
articleRoute.delete('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findByIdAndDelete(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Find and delete menus that contain this article
        const menus = await Menu.find({ articles: id });
        for (const menu of menus) {
            await Menu.findByIdAndDelete(menu._id);
        }

        res.status(200).json({ message: 'Article and associated menus deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = articleRoute;
