const express = require("express");
const restaurantRoute = express.Router();
const Restaurant = require("../models/restaurant");
const Article = require("../models/article");
const Menu = require("../models/menu");
const isAuth = require("../middleware/passport");

const multer = require("multer");
const cloudinary = require("../config/cloudinary"); // Import your cloudinary configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new restaurant
restaurantRoute.post("/register", async (req, res) => {
  const { name, address, phone, email, ownerId, workingHours, category } =
    req.body; // Include workingHours in the request body
  try {
    // Check if a restaurant with the same name already exists
    const existingRestaurant = await Restaurant.findOne({ name });
    if (existingRestaurant) {
      return res
        .status(400)
        .json({ error: "A restaurant with this name already exists." });
    }

    const newRestaurant = new Restaurant({
      name,
      address,
      phone,
      email,
      ownerId,
      workingHours,
      category,
    });
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all restaurants
restaurantRoute.get("/all", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a restaurant by ID
restaurantRoute.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findById(id).populate("articles menus");
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get restaurants by name
restaurantRoute.get("/name/:name", async (req, res) => {
  const { name } = req.params;
  console.log('Requête de recherche de restaurant avec le nom :', name);
  try {
     const restaurant = await Restaurant.find({name: { $regex: name, $options: 'i' }});
    //  const restaurant = await Restaurant.find({name:  {$regex: name, $options: 'id'}}, { _id: 0 });
    if (restaurant.length===0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("An error occured:", error.message)
    res.status(500).json({error : error.message});
  }
});

// Get restaurants by owner ID
restaurantRoute.get("/owner/:ownerId", async (req, res) => {
  const { ownerId } = req.params;
  try {
    const restaurants = await Restaurant.find({ ownerId });
    if (!restaurants || restaurants.length === 0) {
      return res
        .status(404)
        .json({ error: "No restaurants found for this owner" });
    }
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a restaurant by ID
restaurantRoute.put("/:id", isAuth(), async (req, res) => {
  const { id } = req.params;
  const { name, address, phone, email, workingHours, category } = req.body; // Include workingHours in the request body
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Update the restaurant's fields
    restaurant.name = name !== undefined ? name : restaurant.name;
    restaurant.address = address !== undefined ? address : restaurant.address;
    restaurant.phone = phone !== undefined ? phone : restaurant.phone;
    restaurant.email = email !== undefined ? email : restaurant.email;
    restaurant.workingHours =
      workingHours !== undefined ? workingHours : restaurant.workingHours; // Update workingHours
    restaurant.category =
      category !== undefined ? category : restaurant.category; // Update category

    await restaurant.save();
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a restaurant by ID
restaurantRoute.delete("/:id", isAuth(), async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload restaurant image
restaurantRoute.post(
  "/upload-image/:id",
  isAuth(),
  upload.single("img"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const restaurant = await Restaurant.findById(req.params.id);
      if (restaurant.imgPublicId) {
        // Delete the old image from Cloudinary
        await cloudinary.uploader.destroy(restaurant.imgPublicId);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      // Update restaurant with image URL and public ID
      restaurant.img = uploadResult.secure_url;
      restaurant.imgPublicId = uploadResult.public_id;
      await restaurant.save();

      res.send({ restaurant, msg: "Image uploaded successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Rate a restaurant
restaurantRoute.post("/:id/rate", isAuth(), async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "Rating must be a number between 1 and 5." });
  }

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    await restaurant.addRating(rating);
    const averageRating = restaurant.getAverageRating();

    res
      .status(200)
      .json({ message: "Rating added successfully.", averageRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//-----------------------------------------------------------------
//                    touskié menu / article
//-----------------------------------------------------------------

// Get all articles for a specific restaurant
restaurantRoute.get("/:id/articles", async (req, res) => {
  const { id } = req.params;
  try {
    const articles = await Article.find({ restaurantId: id });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all menus for a specific restaurant
restaurantRoute.get("/:id/menus", isAuth(), async (req, res) => {
  const { id } = req.params;
  try {
    const menus = await Menu.find({ restaurantId: id }).populate("articles");
    res.status(200).json(menus);
  } catch (error) {
    res.status500().json({ error: error.message });
  }
});

// Filter articles by category for a specific restaurant
restaurantRoute.get("/:id/articles/category/:category", async (req, res) => {
  const { id, category } = req.params;
  try {
    const articles = await Article.find({ restaurantId: id, category });
    if (!articles || articles.length === 0) {
      return res
        .status(404)
        .json({ error: "No articles found for this category" });
    }
    res.status(200).json(articles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get restaurants by category
restaurantRoute.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const restaurants = await Restaurant.find({ category });
    if (!restaurants || restaurants.length === 0) {
      return res
        .status(404)
        .json({ error: "No restaurants found for this category" });
    }
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = restaurantRoute;
