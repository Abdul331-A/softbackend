import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        otp: { type: String }, // Add this field

        username: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [Longitude, Latitude]
                index: "2dsphere", // IMPORTANT for geo queries
                default: undefined
            },
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 300
        },

        category: {
            mainCategory: {
                type: String,
                trim: true,
                // default: ""
            },
            subCategory: {
                type: String,
                trim: true,
                // default: ""
            }
        },

        profilePic: {
            type: String,
            default: ""
        },

        password: {
            type: String
        },

        isOtpVerified: {
            type: Boolean,
            default: false
        },

        isPasswordCreated: {
            type: Boolean,
            default: false
        },

        // 🔐 Forgot password fields
        resetOtp: {
            type: String
        },
        resetOtpExpire: {
            type: Date
        },
        otpVerified: {
            type: Boolean,
            default: false
        },


        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },

    { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
