import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const requestOtp = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.json({ success: false, message: "phoneNumber required" });
    }

    // Normally send SMS here
    const otp = "123456";

    res.json({
        success: true,
        message: "OTP sent",
        otp, // only for testing
        phoneNumber,
    });
};


export const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (otp !== "123456") {
        return res.json({ success: false, message: "Invalid OTP" });
    }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
        user = await User.create({
            phoneNumber,
            isOtpVerified: true
        });
    } else {
        user.isOtpVerified = true;
        await user.save();
    }

    const token = generateToken(user._id);

    res.json({
        success: true,
        token,
        message: "OTP verified"
    });
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
        if (user.isPasswordCreated) {
            return res.status(400).json({
                success: false,
                message: "Credentials already created",
            });
        }

        // 3. Check username uniqueness
        const exists = await User.findOne({ username });
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

        if (req.file) {
            // This saves "uploads/1712345.jpg" to the DB
            user.profilePic = `uploads/${req.file.filename}`;
        }

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


// export const updateProfile = async (req, res) => {
//     try {
//         const userId = req.user?._id || req.params.id;
//         const { username, location, bio, mainCategory, subCategory } = req.body;

//         const updateData = {};
//         if (username) updateData.username = username;
//         if (location) updateData.location = location;
//         if (bio) updateData.bio = bio;
//         if (mainCategory) updateData["category.main"] = mainCategory;
//         if (subCategory) updateData["category.sub"] = subCategory;

//         // MULTER LOGIC HERE
//         if (req.file) {
//             updateData.profilePic = req.file.path; // Saves "uploads/filename.jpg"
//         }

//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             { $set: updateData },
//             { new: true, runValidators: true }
//         ).select("-password");

//         res.status(200).json({ success: true, userData: updatedUser });
//     } catch (error) {
//         // ... error handling
//         res.status(500).json({ message: error.message })
//     }
// };


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { location, bio, mainCategory, subCategory } = req.body;

        const updateData = {};

        if (location) updateData.location = location;
        if (bio) updateData.bio = bio;

        if (mainCategory || subCategory) {
            updateData.category = {};
            if (mainCategory) updateData.category.main = mainCategory;
            if (subCategory) updateData.category.sub = subCategory;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

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


