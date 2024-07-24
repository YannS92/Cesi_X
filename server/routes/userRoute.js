const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("../models/user");
const DeliveryPerson = require("../models/delivery-person");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const {loginRules, registerRules, Validation} = require("../middleware/auth-validator");
const isAuth = require("../middleware/passport");
const fs = require("fs");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({storage});
require("dotenv").config();
const UserRole = require("../../client/src/type.tsx");
const cloudinary = require('../config/cloudinary');
const crypto = require('crypto');
const addLog = require("../utils/addLog.jsx");

// Middleware to check user roles
const checkRole = (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
        next();
    } else {
        res
            .status(403)
            .json({message: "Access denied: You do not have sufficient permissions to access this resource."});
    }
};

// Function to generate referral codes
const generateReferralCode = () => {
    return crypto
        .randomBytes(3)
        .toString('hex');
};

// Validate referral code endpoint
userRouter.get("/referral/validate/:referralCode", isAuth(), async(req, res) => {
    const {referralCode} = req.params;
    try {
        const user = await User.findOne({referralCode});
        if (!user) {
            return res
                .status(400)
                .send({valid: false, msg: "Invalid referral code"});
        }
        res
            .status(200)
            .send({valid: true, discountPercentage: 10}); // Example discount percentage
    } catch (error) {
        console.error("An error occurred:", error.message);
        res
            .status(500)
            .send({valid: false, msg: "Server error"});
    }
});

// Register new user
userRouter.post("/register", registerRules(), Validation, async(req, res) => {
    const {
        name,
        email,
        password,
        role,
        address,
        phoneNumber,
        referralCode,
        vehicleDetails
    } = req.body;
    try {
        const newUser = new User({
            name,
            email,
            password,
            role,
            address,
            phoneNumber,
            referralCode
        });

        // Check if email exists
        const searchedUser = await User.findOne({email});
        if (searchedUser) {
            return res
                .status(400)
                .send({msg: "Email already exists"});
        }

        // Handle referral code
        if (referralCode) {
            const referringUser = await User.findOne({referralCode});
            if (referringUser) {
                newUser.referredBy = referringUser._id;
            } else {
                return res
                    .status(400)
                    .send({msg: "Invalid referral code"});
            }
        }

        // Generate a unique referral code for the new user
        newUser.referralCode = generateReferralCode();

        // Hash password
        const salt = 10;
        const genSalt = await bcrypt.genSalt(salt);
        const hashedPassword = await bcrypt.hash(password, genSalt);
        newUser.password = hashedPassword;

        // Save user
        const result = await newUser.save();

        // If the user is a delivery person, create a delivery person entry
        if (role === "deliveryPerson") {
            const deliveryPerson = new DeliveryPerson({userId: result._id, vehicleDetails: vehicleDetails, available: true});
            await deliveryPerson.save();
        }

        // Generate a token
        const payload = {
            _id: result._id,
            name: result.name
        };
        const token = await jwt.sign(payload, process.env.SecretOrKey, {
            expiresIn: 1000 * 60 * 60 * 24
        });

        // Add log entry
        await addLog(result._id, 'User registered');

        res.send({user: result, msg: "User is saved", token: `Bearer ${token}`});
    } catch (error) {
        console.error("An error occurred:", error.message); // Log the error
        res
            .status(500)
            .send({msg: "Cannot save the user", error: error.message}); // Improved error response
    }
});

// Login user
userRouter.post("/login", loginRules(), Validation, async(req, res) => {
    const {email, password} = req.body;
    try {
        const searchedUser = await User
            .findOne({email})
            .populate("deliveryPerson");

        // If the email does not exist
        if (!searchedUser) {
            return res
                .status(400)
                .send({msg: "Bad credential"});
        }

        // Check if the user is suspended
        if (searchedUser.suspended) {
            return res
                .status(403)
                .send({msg: "Account is suspended"});
        }

        // Check password
        const match = await bcrypt.compare(password, searchedUser.password);
        if (!match) {
            return res
                .status(400)
                .send({msg: "Bad credential"});
        }

        // Create a token
        const payload = {
            _id: searchedUser.id,
            name: searchedUser.name
        };
        const token = await jwt.sign(payload, process.env.SecretOrKey, {
            expiresIn: 1000 * 3600 * 24
        });

        // Add log entry
        await addLog(searchedUser._id, 'User logged in');

        res
            .status(200)
            .send({user: searchedUser, msg: "Success", token: `Bearer ${token}`});
    } catch (error) {
        console.error("An error occurred:", error.message);
        res.send({msg: "Cannot get the user"});
    }
});

// Validate referral code
userRouter.get('/referral/validate/:referralCode', async(req, res) => {
    const {referralCode} = req.params;
    try {
        const user = await User.findOne({referralCode});
        if (!user) {
            return res
                .status(400)
                .json({valid: false});
        }
        res.json({valid: true, discountPercentage: 10}); // Example discount value
    } catch (error) {
        console.error('Error validating referral code:', error);
        res
            .status(500)
            .json({error: 'Server error'});
    }
});

// Get user referral details
userRouter.get('/referral/details/:userId', isAuth(), async(req, res) => {
    const {userId} = req.params;
    try {
        const user = await User
            .findById(userId)
            .populate('referredBy');
        if (!user) {
            return res
                .status(404)
                .json({error: 'User not found'});
        }
        const referredUsers = await User.find({referredBy: userId});
        res.json({referralCode: user.referralCode, referredUsers});
    } catch (error) {
        console.error('Error fetching referral details:', error);
        res
            .status(500)
            .json({error: 'Server error'});
    }
});

// Add new user (requires role check)
userRouter.post("/add", isAuth(), checkRole(["admin"]), async(req, res) => {
    try {
        let newUser = new User(req.body);
        const result = await newUser.save();
        res.send({result: result, msg: "User added"});
    } catch (error) {
        console.log(error);
    }
});

// Get all users (requires role check)
userRouter.get("/all", isAuth(), checkRole(['admin']), async(req, res) => {
    try {
        let result = await User
            .find()
            .populate("deliveryPerson");
        res.send({users: result, msg: "All users"});
    } catch (error) {
        console.log(error);
    }
});

// Get user by ID (requires role check)
userRouter.get("/find/:id", isAuth(), checkRole(["admin"]), async(req, res) => {
    try {
        let result = await User
            .findById(req.params.id)
            .populate("deliveryPerson");
        res.send({users: result, msg: "This is the user by ID"});
    } catch (error) {
        console.log(error);
    }
});

// Update user by ID (requires role check)
userRouter.put("/update/:id", isAuth(), async(req, res) => {
    try {
        const {
            oldPassword,
            password,
            vehicleDetails,
            ...otherUpdates
        } = req.body;

        let updateUser = {
            ...otherUpdates
        };

        const user = await User.findById(req.params.id);
        if (!user) {
            return res
                .status(404)
                .send("User not found");
        }

        // If the password is being updated, verify the old password first
        if (password) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({error: "Old password is incorrect"});
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateUser.password = hashedPassword;
        }

        let result = await User.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: updateUser
        }, {new: true});

        // If the user is a delivery person, update the delivery person entry
        if (result.role === "deliveryPerson") {
            await DeliveryPerson.findOneAndUpdate({
                userId: result._id
            }, {
                vehicleDetails
            }, {new: true});
        }

        // Add log entry
        await addLog(req.params.id, 'User updated');

        res.send({newUser: result, msg: "User updated"});
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send("Internal Server Error");
    }
});

// Delete user by ID (requires role check)
userRouter.delete("/delete/:id", isAuth(), async(req, res) => {
    try {
        let result = await User.findByIdAndDelete(req.params.id);

        // If the user is a delivery person, delete the delivery person entry
        if (result.role === "deliveryPerson") {
            await DeliveryPerson.findOneAndDelete({userId: result._id});
        }

        // Add log entry
        await addLog(req.params.id, 'User deleted');

        res.send({msg: "User deleted"});
    } catch (error) {
        console.log(error);
    }
});

// Get current user
userRouter.get("/current", isAuth(), async(req, res) => {
    try {
        const currentUser = await User
            .findById(req.user._id)
            .populate("deliveryPerson");
        res
            .status(200)
            .send({user: currentUser});
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send("Internal Server Error");
    }
});

// Upload user image
userRouter.post("/upload-image", isAuth(), upload.single("img"), async(req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .send("No file uploaded.");
        }

        const user = await User.findById(req.user._id);
        if (user.imgPublicId) {
            // Delete the old image from Cloudinary
            await cloudinary
                .uploader
                .destroy(user.imgPublicId);
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary
                .uploader
                .upload_stream((error, result) => {
                    if (error) 
                        reject(error);
                    else 
                        resolve(result);
                    }
                );
            uploadStream.end(req.file.buffer);
        });

        // Update user with image URL and public ID
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            img: uploadResult.secure_url,
            imgPublicId: uploadResult.public_id
        }, {new: true});

        // Add log entry
        await addLog(req.user._id, 'User image uploaded');

        res.send({user: updatedUser, msg: "Image uploaded successfully"});
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send("Internal Server Error");
    }
});

//------------------------------------------------------------------------------
// ---- --------------------------------- Admin only
// ------------------------------------
// ------------------------------------------------------------------------------
// ---- Fetch logs for a specific user (Admin only)
userRouter.get("/logs/:id", isAuth(), checkRole(["admin"]), async(req, res) => {
    try {
        const user = await User
            .findById(req.params.id)
            .select('name email logHistory');
        if (!user) {
            return res
                .status(404)
                .send({msg: "User not found"});
        }
        res
            .status(200)
            .send({logs: user.logHistory});
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send("Internal Server Error");
    }
});

userRouter.put('/suspend/:id', isAuth(), checkRole(['admin']), async(req, res) => {
    try {
        const userId = req.params.id;
        const {suspend} = req.body; // true to suspend, false to unsuspend

        const user = await User.findByIdAndUpdate(userId, {
            suspended: suspend
        }, {new: true});
        if (!user) {
            return res
                .status(404)
                .send({msg: 'User not found'});
        }

        res.send({
            user,
            msg: `User has been ${suspend
                ? 'suspended'
                : 'unsuspended'}`
        });
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .send({msg: 'Internal Server Error'});
    }
});

module.exports = userRouter;
