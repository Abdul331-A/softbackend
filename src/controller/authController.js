import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import fs from "fs";
import { generateOtp } from "../utils/generateOtp.js";

export const requestOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        // Generate OTP (Static for now, but usually random)
        const otp = generateOtp();

        // Logic: Find the user, if not found, create a new one (Upsert)
        // We save the OTP to the user record to verify it later
        let user = await User.findOne({ phoneNumber });

        if (!user) {
            user = await User.create({
                phoneNumber,
                otp, // Save OTP to DB
                isOtpVerified: false
            });
        } else {
            // If user exists, update their OTP
            user.otp = otp;
            user.isOtpVerified = false; // Reset verification status
            await user.save();
        }

        // Respond with success AND the userId (Client needs to store this for step 2)
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            userId: user._id, // <--- Key change: Send ID to client
            otp // Remove this in production
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const verifyOtp = async (req, res) => {
    try {

        const userId = req.params.userId; // Get userId from URL params

        // We remove phoneNumber and use userId instead
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP are required" });
        }

        // Find user by ID (Since we don't have phone number in this request)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify OTP matches the one saved in DB
        // Note: In production, compare hashed OTPs
        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Clean up and Verify
        user.otp = null; // Clear OTP after usage to prevent reuse
        user.isOtpVerified = true;
        await user.save();

        // Generate Token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            token,
            user: {
                _id: user._id,
                phoneNumber: user.phoneNumber
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const createCredentials = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userId = req.user.userId;

        // 1. Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 2. Prevent overwriting
        // if (user.isPasswordCreated) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Credentials already created",
        //     });
        // }

        // 3. Check username uniqueness
        const exists = await User.findOne({
            username,
            _id: { $ne: userId }
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Username taken",
            });
        }

        // 4. Hash password
        const hash = await bcrypt.hash(password, 10);

        // 5. Update user
        user.username = username;
        user.password = hash;
        user.isPasswordCreated = true;
        // user.profilePic = ""; // Default to empty string

        // --- CLOUDINARY LOGIC START ---
        // Default to empty string if no file uploaded
        if (req.file) {
            user.profilePic = req.file.path;
        }
        // --- CLOUDINARY LOGIC END ---

        await user.save();

        res.status(200).json({
            success: true,
            message: "Credentials and profile picture setup complete",
            user: {
                username: user.username,
                profilePic: user.profilePic,
            },
        });

    } catch (error) {
        console.error("Error in createCredentials:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const getProfile = async (req, res) => {
    const user = await User.findById(req.user.userId)

        .select("-password");

    res.json({
        success: true,
        user
    });
};



export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.userId;

        const {
            location,
            bio,
            mainCategory,
            subCategory,
            username: newUsername
        } = req.body;

        const updateData = {};

        // ---------- Basic fields ----------
        if (location) updateData.location = location;
        if (bio) updateData.bio = bio;

        // ---------- Category ----------
        if (mainCategory || subCategory) {
            updateData.category = {};
            if (mainCategory) updateData.category.mainCategory = mainCategory;
            if (subCategory) updateData.category.subCategory = subCategory;
        }

        // ---------- Username update ----------
        if (newUsername) {
            const normalizedUsername = newUsername.toLowerCase().trim();

            // OPTIONAL validation
            // const usernameRegex = /^[a-z0-9_.]{3,20}$/;
            // if (!usernameRegex.test(normalizedUsername)) {
            //     return res.status(400).json({
            //         success: false,
            //         message:
            //             "Username must be 3–20 characters and contain only letters, numbers, underscores, or dots",
            //     });
            // }

            // fetch current user
            const currentUser = await User.findById(userId).select("username");
            if (!currentUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // same username → skip update
            if (currentUser.username === normalizedUsername) {
                res.status(200).json({
                    success: true,
                    message: "Username unchanged",
                    user: currentUser,
                });
            }

            // check uniqueness
            const usernameTaken = await User.findOne({
                username: normalizedUsername,
                _id: { $ne: userId },
            });

            if (usernameTaken) {
                return res.status(409).json({
                    success: false,
                    message: "Username already taken",
                });
            }

            updateData.username = normalizedUsername;
        }

        // ---------- Profile pic ----------
        if (req.file) {
            updateData.profilePic = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -followers -following -otp");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
};


